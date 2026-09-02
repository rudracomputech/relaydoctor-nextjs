import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Patient from '@/models/Patient';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const patients = await Patient.find({
      $or: [{ doctorId: user!._id }, { registeredBy: user!._id }],
    }).sort({ visitDate: -1, createdAt: -1 });

    return jsonSuccess(patients, 'Patients fetched successfully', 200, { data: patients });
  } catch (error: any) {
    console.error('Get Patients Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, age, gender, mobile, phone, address, problem, diagnosis, prescription } = body;

    const contactNumber = mobile || phone;
    if (!name || !age || !gender || !contactNumber || !problem) {
      return jsonError('Please provide all required fields: name, age, gender, mobile, problem', 400);
    }

    const newPatient = await Patient.create({
      doctorId: user!._id,
      registeredBy: user!._id,
      name,
      age: Number(age),
      gender,
      mobile: contactNumber,
      phone: contactNumber,
      address: address || '',
      problem,
      medicalHistory: problem,
      diagnosis: diagnosis || '',
      prescription: prescription || '',
      visitDate: new Date(),
    });

    return jsonSuccess(newPatient, 'Patient added successfully', 201, { data: newPatient });
  } catch (error: any) {
    console.error('Add Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
