import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const availabilityStatus = body.availabilityStatus || body.status || body.availability;
    if (!availabilityStatus) {
      return jsonError('Availability status is required', 400);
    }

    user!.availabilityStatus = availabilityStatus;
    await user!.save();

    return jsonSuccess({ doctor: user, availabilityStatus }, 'Availability updated', 200, { doctor: user });
  } catch (error: any) {
    console.error('Availability Update Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export const POST = PUT;
export const PATCH = PUT;
