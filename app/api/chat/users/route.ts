import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const currentUserId = user!._id.toString();
    const currentUserRole = user!.userRole || user!.role;

    const allowedRoles =
      currentUserRole === 'doctor' || currentUserRole === 'admin'
        ? ['doctor', 'admin']
        : ['doctor', 'admin', 'user'];

    const filter: any = {
      _id: { $ne: currentUserId },
      $or: [
        { userRole: { $in: allowedRoles } },
        { role: { $in: allowedRoles } },
      ],
    };

    const users = await User.find(filter).select(
      'name userRole role profileImage avatar clinicAddress hospitalAddress hospital speciality specialization availabilityStatus'
    );

    const formattedUsers = users.map((u: any) => {
      const obj = u.toObject ? u.toObject() : u;
      return {
        ...obj,
        id: obj._id.toString(),
        avatarUrl: obj.avatar || obj.profileImage || '',
      };
    });

    return jsonSuccess(formattedUsers, 'Chat users fetched successfully', 200, {
      data: formattedUsers,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error('Get Chat Users Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
