import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

import mongoose from 'mongoose';

export async function GET(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? Referral.findById(id)
      : Referral.findOne({ ticketNumber: id });

    const referral = await query
      .populate('fromDoctor', 'name email speciality specialization avatar profileImage')
      .populate('toDoctor', 'name email speciality specialization avatar profileImage')
      .populate('referringDoctorId', 'name email speciality specialization avatar profileImage')
      .populate('receivingDoctorId', 'name email speciality specialization avatar profileImage');

    if (!referral) {
      return jsonError('Referral not found', 404);
    }

    const fromId = (referral.fromDoctor?._id || referral.fromDoctor || referral.referringDoctorId?._id || referral.referringDoctorId)?.toString();
    const toId = (referral.toDoctor?._id || referral.toDoctor || referral.receivingDoctorId?._id || referral.receivingDoctorId)?.toString();
    const userId = user!._id.toString();

    if (fromId !== userId && toId !== userId && user!.userRole !== 'admin' && user!.role !== 'admin') {
      return jsonError('Access denied', 403);
    }

    const obj: any = referral.toObject ? referral.toObject() : referral;
    const targetDoctor: any = obj.toDoctor || obj.receivingDoctorId;
    const sourceDoctor: any = obj.fromDoctor || obj.referringDoctorId;

    const formattedReferral = {
      ...obj,
      id: obj._id.toString(),
      name: obj.patientName || 'Patient',
      patientName: obj.patientName || 'Patient',
      phone: obj.patientContact || obj.contactNumber || '',
      mobile: obj.patientContact || obj.contactNumber || '',
      description: obj.reasonForReferral || obj.feedbackNotes || obj.feedback || '',
      problem: obj.reasonForReferral || obj.feedbackNotes || obj.feedback || '',
      condition: obj.professionalDiagnosis || obj.diagnosis || '',
      diagnosis: obj.professionalDiagnosis || obj.diagnosis || '',
      status: obj.status ? (obj.status.charAt(0).toUpperCase() + obj.status.slice(1)) : 'Pending',
      referredDoctorName: targetDoctor?.name || sourceDoctor?.name || 'Doctor',
      referredDoctorSpecialty: targetDoctor?.speciality || targetDoctor?.specialization || 'Specialist',
      referredDoctorAvatar: targetDoctor?.avatar || targetDoctor?.profileImage || '',
      referralDate: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    };

    return jsonSuccess(formattedReferral, 'Referral fetched successfully', 200, {
      data: formattedReferral,
      referral: formattedReferral,
    });
  } catch (error: any) {
    console.error('Get Referral By ID Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
