import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Referral from '@/models/Referral';

import mongoose from 'mongoose';

export async function PATCH(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const { status, note } = await req.json();

    if (!status) {
      return jsonError('Status is required', 400);
    }

    let normalizedStatus = status.toString().trim().toLowerCase().replace(/\s+/g, '_');
    if (normalizedStatus === 'accept') normalizedStatus = 'accepted';
    if (normalizedStatus === 'reject') normalizedStatus = 'rejected';
    if (normalizedStatus === 'complete') normalizedStatus = 'completed';
    if (normalizedStatus === 'decline') normalizedStatus = 'declined';

    const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed', 'declined', 'in_progress'];
    if (!allowedStatuses.includes(normalizedStatus)) {
      return jsonError(`Invalid status value. Allowed: ${allowedStatuses.join(', ')}`, 400);
    }

    const referral = mongoose.Types.ObjectId.isValid(id)
      ? await Referral.findById(id)
      : await Referral.findOne({ ticketNumber: id });

    if (!referral) {
      return jsonError('Referral not found', 404);
    }

    referral.status = normalizedStatus as any;
    referral.lastUpdated = new Date();
    if (!referral.statusHistory) referral.statusHistory = [];
    referral.statusHistory.push({
      status: normalizedStatus,
      changedAt: new Date(),
      note: note || `Status updated to ${normalizedStatus}`,
    });

    await referral.save();

    return jsonSuccess(referral, 'Referral status updated', 200, {
      data: referral,
      referral,
    });
  } catch (error: any) {
    console.error('Update Referral Status Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export const PUT = PATCH;
