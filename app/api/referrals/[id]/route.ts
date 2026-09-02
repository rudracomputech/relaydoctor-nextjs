import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

export async function GET(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const referral = await Referral.findById(id)
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

    return jsonSuccess(referral, 'Referral fetched successfully', 200, { data: referral });
  } catch (error: any) {
    console.error('Get Referral By ID Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
