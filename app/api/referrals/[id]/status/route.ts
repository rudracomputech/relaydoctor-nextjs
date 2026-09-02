import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

export async function PATCH(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const { status, note } = await req.json();

    if (!status) {
      return jsonError('Status is required', 400);
    }

    const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed', 'declined', 'in_progress'];
    if (!allowedStatuses.includes(status)) {
      return jsonError('Invalid status value', 400);
    }

    const referral = await Referral.findById(id);
    if (!referral) {
      return jsonError('Referral not found', 404);
    }

    const toId = (referral.toDoctor?._id || referral.toDoctor || referral.receivingDoctorId?._id || referral.receivingDoctorId)?.toString();
    const userId = user!._id.toString();

    if (toId !== userId && user!.userRole !== 'admin' && user!.role !== 'admin') {
      return jsonError('Not authorized to update this referral', 403);
    }

    referral.status = status as any;
    referral.lastUpdated = new Date();
    if (!referral.statusHistory) referral.statusHistory = [];
    referral.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status updated to ${status}`,
    });

    await referral.save();

    return jsonSuccess(referral, 'Referral status updated', 200, { data: referral });
  } catch (error: any) {
    console.error('Update Referral Status Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
