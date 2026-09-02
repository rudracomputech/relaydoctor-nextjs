import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import fs from 'fs';
import path from 'path';

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const contentType = req.headers.get('content-type') || '';
    let imageUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('profileImage') as File;

      if (!file) {
        return jsonError('profileImage is required', 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name) || '.jpg';
      const filename = `profile_${user!._id}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/profiles/${filename}`;
    } else {
      const body = await req.json();
      imageUrl = body.profileImage || body.avatar || body.url;
      if (!imageUrl) {
        return jsonError('profileImage is required', 400);
      }
    }

    user!.profileImage = imageUrl;
    user!.avatar = imageUrl;
    await user!.save();

    return jsonSuccess(
      { profileImage: user!.profileImage },
      'Profile image uploaded successfully.',
      200,
      { profileImage: user!.profileImage }
    );
  } catch (error: any) {
    console.error('Upload Profile Image Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
