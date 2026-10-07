import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Patient from '@/models/Patient';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const patients = await Patient.find({
      $or: [{ doctorId: user!._id }, { registeredBy: user!._id }],
    }).sort({ visitDate: -1, createdAt: -1 });

    const formattedPatients = patients.map((p: any) => {
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
    });

    return jsonSuccess(formattedPatients, 'Patients fetched successfully', 200, {
      data: formattedPatients,
      patients: formattedPatients,
    });
  } catch (error: any) {
    console.error('Get Patients Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req, ['doctor', 'admin', 'user']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, age, gender, mobile, phone, address, problem, description, diagnosis, condition, prescription } = body;

    const contactNumber = mobile || phone || '';
    const patientProblem = problem || description || condition || 'General Checkup';

    if (!name) {
      return jsonError('Please provide patient name', 400);
    }

    const newPatient = await Patient.create({
      doctorId: user!._id,
      registeredBy: user!._id,
      name,
      age: Number(age) || 30,
      gender: gender || 'male',
      mobile: contactNumber,
      phone: contactNumber,
      address: address || '',
      problem: patientProblem,
      medicalHistory: patientProblem,
      diagnosis: diagnosis || condition || '',
      prescription: prescription || '',
      visitDate: new Date(),
    });

    const formattedPatient = {
      ...newPatient.toObject(),
      id: newPatient._id.toString(),
      phone: newPatient.mobile || newPatient.phone || '',
      description: newPatient.problem,
      condition: newPatient.diagnosis,
      status: newPatient.caseStatus || 'Pending',
      avatarUrl:
        newPatient.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    };

    return jsonSuccess(formattedPatient, 'Patient added successfully', 201, {
      data: formattedPatient,
      patient: formattedPatient,
    });
  } catch (error: any) {
    console.error('Add Patient Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
