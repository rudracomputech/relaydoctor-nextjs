import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const referrals = await Referral.find({
      $or: [{ toDoctor: user!._id }, { receivingDoctorId: user!._id }],
    })
      .sort({ createdAt: -1 })
      .populate('fromDoctor', 'name email speciality specialization avatar profileImage')
      .populate('referringDoctorId', 'name email speciality specialization avatar profileImage');

    const formattedReferrals = referrals.map((ref: any) => {
      const obj = ref.toObject ? ref.toObject() : ref;
      const sourceDoctor = obj.fromDoctor || obj.referringDoctorId;

      return {
        ...obj,
        id: obj._id.toString(),
        name: obj.patientName || obj.name || 'Patient',
        patientName: obj.patientName || obj.name || 'Patient',
        phone: obj.patientContact || obj.contactNumber || '',
        mobile: obj.patientContact || obj.contactNumber || '',
        description: obj.reasonForReferral || obj.feedbackNotes || obj.feedback || '',
        problem: obj.reasonForReferral || obj.feedbackNotes || obj.feedback || '',
        condition: obj.professionalDiagnosis || obj.diagnosis || 'Referral Consultation',
        diagnosis: obj.professionalDiagnosis || obj.diagnosis || 'Referral Consultation',
        status: obj.status ? (obj.status.charAt(0).toUpperCase() + obj.status.slice(1)) : 'Pending',
        referredDoctorName: sourceDoctor?.name || 'Dr. Referring Doctor',
        referredDoctorSpecialty: sourceDoctor?.speciality || sourceDoctor?.specialization || 'General',
        referredDoctorAvatar:
          sourceDoctor?.avatar ||
          sourceDoctor?.profileImage ||
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80',
        referralDate: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      };
    });

    return jsonSuccess(formattedReferrals, 'Received referrals fetched', 200, {
      data: formattedReferrals,
      referrals: formattedReferrals,
    });
  } catch (error: any) {
    console.error('Get Received Referrals Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
