import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';
import User from '@/models/User';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import Patient from '@/models/Patient';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const contentType = req.headers.get('content-type') || '';
    let toDoctorId = '';
    let patientId = '';
    let patientName = '';
    let patientContact = '';
    let professionalDiagnosis = '';
    let reasonForReferral = '';
    let notes = '';
    let feedback = '';
    let attachment: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      toDoctorId = (formData.get('toDoctorId') || formData.get('receivingDoctorId') || '') as string;
      patientId = (formData.get('patientId') || '') as string;
      patientName = (formData.get('patientName') || '') as string;
      patientContact = (formData.get('patientContact') || formData.get('contactNumber') || '') as string;
      professionalDiagnosis = (formData.get('professionalDiagnosis') || formData.get('diagnosis') || '') as string;
      reasonForReferral = (formData.get('reasonForReferral') || '') as string;
      notes = (formData.get('notes') || '') as string;
      feedback = (formData.get('feedback') || formData.get('feedbackNotes') || '') as string;

      const file = formData.get('attachment') as File;
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'referrals');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(file.name) || '.pdf';
        const filename = `ref_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        attachment = `/uploads/referrals/${filename}`;
      }
    } else {
      const body = await req.json();
      toDoctorId = body.toDoctorId || body.receivingDoctorId || '';
      patientId = body.patientId || '';
      patientName = body.patientName || '';
      patientContact = body.patientContact || body.contactNumber || '';
      professionalDiagnosis = body.professionalDiagnosis || body.diagnosis || '';
      reasonForReferral = body.reasonForReferral || '';
      notes = body.notes || '';
      feedback = body.feedback || body.feedbackNotes || '';
      attachment = body.attachment || (body.attachments && body.attachments[0]) || null;
    }

    if (!toDoctorId) {
      return jsonError('toDoctorId is required', 400);
    }

    // If patientId is provided, look up patient details
    let resolvedPatientDoc: any = null;
    if (patientId) {
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        resolvedPatientDoc = await Patient.findById(patientId);
      }
      if (!resolvedPatientDoc) {
        resolvedPatientDoc = await Patient.findOne({ patientId });
      }
    }

    if (resolvedPatientDoc) {
      patientName = patientName || resolvedPatientDoc.name;
      patientContact = patientContact || resolvedPatientDoc.mobile || resolvedPatientDoc.phone || '';
      professionalDiagnosis = professionalDiagnosis || resolvedPatientDoc.diagnosis || resolvedPatientDoc.problem || 'Specialist Referral';
      reasonForReferral = reasonForReferral || notes || resolvedPatientDoc.problem || 'Doctor Consultation Referral';
    } else {
      patientName = patientName || (patientId ? `Patient #${patientId.slice(-5)}` : 'Patient');
      patientContact = patientContact || '';
      professionalDiagnosis = professionalDiagnosis || notes || 'Referral Consultation';
      reasonForReferral = reasonForReferral || notes || 'Referred for specialist care';
    }

    if (notes && !feedback) {
      feedback = notes;
    }

    const toDoctor = mongoose.Types.ObjectId.isValid(toDoctorId)
      ? await User.findById(toDoctorId)
      : null;

    const referral = await Referral.create({
      fromDoctor: user!._id,
      referringDoctorId: user!._id,
      toDoctor: toDoctor ? toDoctor._id : toDoctorId,
      receivingDoctorId: toDoctor ? toDoctor._id : toDoctorId,
      patientId: resolvedPatientDoc ? resolvedPatientDoc._id : (mongoose.Types.ObjectId.isValid(patientId) ? patientId : undefined),
      patientName,
      patientContact,
      contactNumber: patientContact,
      professionalDiagnosis,
      diagnosis: professionalDiagnosis,
      reasonForReferral,
      feedback,
      feedbackNotes: feedback,
      attachment,
      attachments: attachment ? [attachment] : [],
      status: 'pending',
      referralTime: new Date(),
      lastUpdated: new Date(),
    });

    const populatedReferral = await Referral.findById(referral._id)
      .populate('fromDoctor', 'name email speciality specialization avatar profileImage')
      .populate('toDoctor', 'name email speciality specialization avatar profileImage');

    return jsonSuccess(populatedReferral, 'Referral created successfully', 201, {
      data: populatedReferral,
      referral: populatedReferral,
    });
  } catch (error: any) {
    console.error('Create Referral Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const referrals = await Referral.find({
      $or: [
        { fromDoctor: user!._id },
        { referringDoctorId: user!._id },
        { toDoctor: user!._id },
        { receivingDoctorId: user!._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('fromDoctor', 'name email speciality specialization avatar profileImage')
      .populate('toDoctor', 'name email speciality specialization avatar profileImage')
      .populate('referringDoctorId', 'name email speciality specialization avatar profileImage')
      .populate('receivingDoctorId', 'name email speciality specialization avatar profileImage');

    return jsonSuccess(referrals, 'Referrals fetched successfully', 200, {
      data: referrals,
      referrals: referrals,
    });
  } catch (error: any) {
    console.error('Get Referrals Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
