import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Patient from '@/models/Patient';

import mongoose from 'mongoose';

function findPatient(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Patient.findById(id);
  }
  return Patient.findOne({ patientId: id });
}

function formatPatientObj(p: any) {
  const obj = p.toObject ? p.toObject() : p;
  return {
    ...obj,
    id: obj._id.toString(),
    phone: obj.mobile || obj.phone || '',
    description: obj.problem || obj.description || '',
    condition: obj.diagnosis || obj.condition || '',
    status: obj.caseStatus || obj.status || 'Pending',
    avatarUrl:
      obj.avatar ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  };
}

export async function GET(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await findPatient(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    const formatted = formatPatientObj(patient);
    return jsonSuccess(formatted, 'Patient fetched successfully', 200, {
      data: formatted,
      patient: formatted,
    });
  } catch (error: any) {
    console.error('Get Patient By ID Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await findPatient(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    const updates = await req.json();
    if (updates.description && !updates.problem) updates.problem = updates.description;
    if (updates.phone && !updates.mobile) updates.mobile = updates.phone;
    if (updates.status && !updates.caseStatus) updates.caseStatus = updates.status;

    Object.assign(patient, updates);
    await patient.save();

    const formatted = formatPatientObj(patient);
    return jsonSuccess(formatted, 'Patient updated successfully', 200, {
      data: formatted,
      patient: formatted,
    });
  } catch (error: any) {
    console.error('Update Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const patient = await findPatient(id);
    if (!patient) {
      return jsonError('Patient not found', 404);
    }

    const doctorId = (patient.doctorId || patient.registeredBy)?.toString();
    if (user!.userRole !== 'admin' && user!.role !== 'admin' && doctorId && doctorId !== user!._id.toString()) {
      return jsonError('Access denied', 403);
    }

    await Patient.deleteOne({ _id: patient._id });

    return jsonSuccess(null, 'Patient deleted successfully', 200);
  } catch (error: any) {
    console.error('Delete Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
