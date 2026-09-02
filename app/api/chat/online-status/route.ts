import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const status = body.status || (body.isOnline ? 'online' : 'offline');

    return jsonSuccess({ status }, `Status updated to ${status}`, 200);
  } catch (error: any) {
    console.error('Update Online Status Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
