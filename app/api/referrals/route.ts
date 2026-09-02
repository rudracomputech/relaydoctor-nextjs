import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';
import User from '@/models/User';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const contentType = req.headers.get('content-type') || '';
    let toDoctorId = '';
    let patientName = '';
    let patientContact = '';
    let professionalDiagnosis = '';
    let reasonForReferral = '';
    let feedback = '';
    let attachment: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      toDoctorId = (formData.get('toDoctorId') || formData.get('receivingDoctorId')) as string;
      patientName = formData.get('patientName') as string;
      patientContact = (formData.get('patientContact') || formData.get('contactNumber')) as string;
      professionalDiagnosis = (formData.get('professionalDiagnosis') || formData.get('diagnosis')) as string;
      reasonForReferral = formData.get('reasonForReferral') as string;
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
      toDoctorId = body.toDoctorId || body.receivingDoctorId;
      patientName = body.patientName;
      patientContact = body.patientContact || body.contactNumber;
      professionalDiagnosis = body.professionalDiagnosis || body.diagnosis;
      reasonForReferral = body.reasonForReferral;
      feedback = body.feedback || body.feedbackNotes || '';
      attachment = body.attachment || (body.attachments && body.attachments[0]) || null;
    }

    if (!toDoctorId || !patientName || !patientContact || !professionalDiagnosis || !reasonForReferral) {
      return jsonError(
        'toDoctorId, patientName, patientContact, professionalDiagnosis and reasonForReferral are required.',
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(toDoctorId)) {
      return jsonError('Invalid Doctor ID format', 400);
    }

    const toDoctor = await User.findById(toDoctorId);
    if (!toDoctor) {
      return jsonError('Selected doctor not found', 404);
    }

    const referral = await Referral.create({
      fromDoctor: user!._id,
      referringDoctorId: user!._id,
      toDoctor: toDoctorId,
      receivingDoctorId: toDoctorId,
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

    return jsonSuccess(populatedReferral, 'Referral created successfully', 201, { data: populatedReferral });
  } catch (error: any) {
    console.error('Create Referral Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
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

    return jsonSuccess(referrals, 'Referrals fetched successfully', 200, { data: referrals });
  } catch (error: any) {
    console.error('Get Referrals Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
