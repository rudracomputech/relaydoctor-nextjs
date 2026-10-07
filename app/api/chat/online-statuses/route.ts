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
      statuses[id.trim()] = 'online';
    }

    return jsonSuccess(statuses, 'Online statuses fetched', 200, { data: statuses, statuses });
  } catch (error: any) {
    console.error('Get Online Statuses Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => ({}));
    const userIds = Array.isArray(body.users) ? body.users : (body.userIds || []);

    const statuses: Record<string, string> = {};
    for (const id of userIds) {
      statuses[id.toString()] = 'online';
    }

    return jsonSuccess(statuses, 'Online statuses fetched', 200, { data: statuses, statuses });
  } catch (error: any) {
    console.error('POST Online Statuses Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
