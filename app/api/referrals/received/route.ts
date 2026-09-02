import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const referrals = await Referral.find({
      $or: [{ toDoctor: user!._id }, { receivingDoctorId: user!._id }],
    })
      .sort({ createdAt: -1 })
      .populate('fromDoctor', 'name email speciality specialization avatar profileImage')
      .populate('referringDoctorId', 'name email speciality specialization avatar profileImage');

    return jsonSuccess(referrals, 'Received referrals fetched', 200, { data: referrals });
  } catch (error: any) {
    console.error('Get Received Referrals Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
