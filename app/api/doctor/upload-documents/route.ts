import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import fs from 'fs';
import path from 'path';

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor']);
    if (errorResponse) return errorResponse;

    if (user!.documentVerification === 'pending') {
      return jsonError('Your previous documents are still pending review. Please wait for admin approval.', 400);
    }

    if (user!.documentVerification === 'approved') {
      return jsonError('Your documents are already approved. No need to upload again.', 400);
    }

    const contentType = req.headers.get('content-type') || '';
    let governmentId = '';
    let medicalCertificate = '';
    let degreeCertificate = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const govFile = formData.get('governmentId') as File;
      const medFile = formData.get('medicalCertificate') as File;
      const degFile = formData.get('degreeCertificate') as File;

      if (!govFile || !medFile || !degFile) {
        return jsonError('All 3 documents are required: governmentId, medicalCertificate, degreeCertificate', 400);
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'docs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const saveFile = async (f: File, prefix: string) => {
        const buffer = Buffer.from(await f.arrayBuffer());
        const ext = path.extname(f.name) || '.pdf';
        const filename = `${prefix}_${user!._id}_${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        return `/uploads/docs/${filename}`;
      };

      governmentId = await saveFile(govFile, 'gov');
      medicalCertificate = await saveFile(medFile, 'med');
      degreeCertificate = await saveFile(degFile, 'deg');
    } else {
      const body = await req.json();
      governmentId = body.governmentId;
      medicalCertificate = body.medicalCertificate;
      degreeCertificate = body.degreeCertificate;

      if (!governmentId || !medicalCertificate || !degreeCertificate) {
        return jsonError('All 3 documents are required: governmentId, medicalCertificate, degreeCertificate', 400);
      }
    }

    user!.documents = {
      governmentId,
      medicalCertificate,
      degreeCertificate,
    };
    user!.documentVerification = 'pending';
    user!.documentRejectReason = '';
    await user!.save();

    return jsonSuccess({ user }, 'Documents uploaded successfully. Waiting for admin approval.', 200, { user });
  } catch (error: any) {
    console.error('Upload Documents Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
