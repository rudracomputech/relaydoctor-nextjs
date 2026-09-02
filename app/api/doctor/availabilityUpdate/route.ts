import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const { availabilityStatus } = await req.json();
    if (!availabilityStatus) {
      return jsonError('Availability status is required', 400);
    }

    user!.availabilityStatus = availabilityStatus;
    await user!.save();

    return jsonSuccess({ doctor: user }, 'Availability updated', 200, { doctor: user });
  } catch (error: any) {
    console.error('Availability Update Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
