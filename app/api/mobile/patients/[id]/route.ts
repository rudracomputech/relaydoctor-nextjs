import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Referral from '@/models/Referral';

export async function GET(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all referrals for this patient
    const referrals = await Referral.find({
      $or: [{ patientId: patient._id }, { contactNumber: patient.phone }],
    })
      .populate('referringDoctorId', 'name specialization hospital avatar')
      .populate('receivingDoctorId', 'name specialization hospital avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      patient,
      referrals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
