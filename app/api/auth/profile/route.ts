import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    return jsonSuccess(user, 'Profile fetched successfully', 200, { user });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
