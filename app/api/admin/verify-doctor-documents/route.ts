import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import User from '@/models/User';
import { sendEmail } from '@/utils/sendEmail';

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['admin']);
    if (errorResponse) return errorResponse;

    const { doctorId, verificationStatus, rejectReason } = await req.json();

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

    const role = doctor.userRole || doctor.role;
    if (role !== 'doctor') {
      return jsonError('User is not a doctor.', 400);
    }

    doctor.documentVerification = verificationStatus;

    let emailSubject = '';
    let emailMessage = '';

    if (verificationStatus === 'rejected') {
      if (!rejectReason) {
        return jsonError('rejectReason is required when rejecting documents.', 400);
      }
      doctor.documentRejectReason = rejectReason;
      emailSubject = 'Document Verification - Action Required';
      emailMessage = `Dear Dr. ${doctor.name},\n\nWe regret to inform you that your submitted documents have not been approved due to the following reason:\n\n${rejectReason}\n\nKindly review the requirements and re-submit the correct documents at your earliest convenience.\n\nBest regards,\nAdmin Team`;
    } else if (verificationStatus === 'approved') {
      doctor.documentRejectReason = '';
      doctor.isVerified = true;
      doctor.verified = true;
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
