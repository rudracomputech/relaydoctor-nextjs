import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import User from '@/models/User';
import { sendEmail } from '@/utils/sendEmail';

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['admin']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const doctorId = body.doctorId || body.id;
    const verificationStatus = (body.verificationStatus || body.status || '').toLowerCase();
    const rejectReason = body.rejectReason || body.reason || '';

    if (!doctorId || !verificationStatus) {
      return jsonError('doctorId and verificationStatus are required.', 400);
    }

    if (!['approved', 'rejected'].includes(verificationStatus)) {
      return jsonError("verificationStatus must be either 'approved' or 'rejected'.", 400);
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return jsonError('Doctor user not found.', 404);
    }

    doctor.documentVerification = verificationStatus as any;

    let emailSubject = '';
    let emailMessage = '';

    if (verificationStatus === 'rejected') {
      doctor.documentRejectReason = rejectReason || 'Documents did not meet verification criteria.';
      emailSubject = 'Document Verification - Action Required';
      emailMessage = `Dear Dr. ${doctor.name},\n\nWe regret to inform you that your submitted documents have not been approved due to the following reason:\n\n${doctor.documentRejectReason}\n\nKindly review the requirements and re-submit the correct documents at your earliest convenience.\n\nBest regards,\nAdmin Team`;
    } else if (verificationStatus === 'approved') {
      doctor.documentRejectReason = '';
      doctor.isVerified = true;
      doctor.verified = true;
      doctor.role = 'doctor';
      doctor.userRole = 'doctor';
      emailSubject = 'Document Verification Successful';
      emailMessage = `Dear Dr. ${doctor.name},\n\nWe are pleased to inform you that your submitted documents have been successfully verified and approved.\n\nYou can now access all features available to verified doctors on our platform.\n\nBest regards,\nAdmin Team`;
    }

    await sendEmail({
      to: doctor.email,
      subject: emailSubject,
      message: emailMessage,
    });

    await doctor.save();

    return jsonSuccess(
      { doctor },
      `Documents ${verificationStatus} successfully.`,
      200,
      { doctor }
    );
  } catch (error: any) {
    console.error('Verify Doctor Documents Error:', error);
    return jsonError(error?.message || 'Internal server error.', 500);
  }
}

export const POST = PUT;
export const PATCH = PUT;
