import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const usersParam = url.searchParams.get('users');
    const userIds = usersParam ? usersParam.split(',') : [];

    const statuses: Record<string, string> = {};
    for (const id of userIds) {
      statuses[id] = 'online';
    }

    return jsonSuccess(statuses, 'Online statuses fetched', 200, { data: statuses });
  } catch (error: any) {
    console.error('Get Online Statuses Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
