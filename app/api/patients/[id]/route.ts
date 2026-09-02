import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Patient from '@/models/Patient';

export async function GET(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    return jsonSuccess(patient, 'Patient fetched successfully', 200, { data: patient });
  } catch (error: any) {
    console.error('Get Patient By ID Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    const updates = await req.json();
    Object.assign(patient, updates);
    await patient.save();

    return jsonSuccess(patient, 'Patient updated successfully', 200, { data: patient });
  } catch (error: any) {
    console.error('Update Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    await Patient.deleteOne({ _id: id });

    return jsonSuccess(null, 'Patient deleted successfully', 200);
  } catch (error: any) {
    console.error('Delete Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
