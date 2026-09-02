import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const filter: any = {};
    if (doctor) {
      filter.$or = [{ registeredBy: doctor._id }, { registeredBy: { $exists: false } }];
    }

    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    const body = await req.json();
    const { name, phone, age, gender, medicalHistory, emergencyContact } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Patient name and phone are required' }, { status: 400 });
    }

    const patient = await Patient.create({
      name,
      phone,
      age: age ? Number(age) : 30,
      gender: gender || 'Male',
      registeredBy: doctor?._id,
      medicalHistory: medicalHistory || '',
      emergencyContact: emergencyContact || '',
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
