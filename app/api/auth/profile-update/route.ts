import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const updates = await req.json();

    // Prevent updating sensitive fields directly
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.role;
    delete updates.userRole;
    delete updates.verified;
    delete updates.isVerified;
    delete updates.emailVerified;
    delete updates.mobileVerified;

    if (updates.speciality && !updates.specialization) updates.specialization = updates.speciality;
    if (updates.specialization && !updates.speciality) updates.speciality = updates.specialization;
    if (updates.mobile && !updates.phone) updates.phone = updates.mobile;
    if (updates.phone && !updates.mobile) updates.mobile = updates.phone;

    Object.assign(user!, updates);
    await user!.save();

    return jsonSuccess(user, 'Profile updated successfully', 200, { user });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
