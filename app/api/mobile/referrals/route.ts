import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Referral from '@/models/Referral';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type') || 'all'; // 'incoming' | 'outgoing' | 'all'
    const status = searchParams.get('status') || 'all';
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const filter: any = {};

    if (doctor) {
      if (type === 'incoming') {
        filter.receivingDoctorId = doctor._id;
      } else if (type === 'outgoing') {
        filter.referringDoctorId = doctor._id;
      } else {
        filter.$or = [{ receivingDoctorId: doctor._id }, { referringDoctorId: doctor._id }];
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (query) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { patientName: { $regex: query, $options: 'i' } },
          { ticketNumber: { $regex: query, $options: 'i' } },
          { contactNumber: { $regex: query, $options: 'i' } },
        ],
      });
    }

    const total = await Referral.countDocuments(filter);
    const referrals = await Referral.find(filter)
      .populate('referringDoctorId', 'name specialization hospital avatar phone')
      .populate('receivingDoctorId', 'name specialization hospital avatar phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: referrals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Referrals GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      receivingDoctorId,
      patientName,
      contactNumber,
      diagnosis,
      testName,
      reasonForReferral,
      feedbackNotes,
      nextFollowUpDate,
      attachments,
      patientId,
    } = body;

    if (!receivingDoctorId || !patientName || !contactNumber || !diagnosis || !reasonForReferral) {
      return NextResponse.json(
        {
          error:
            'receivingDoctorId, patientName, contactNumber, diagnosis, and reasonForReferral are required',
        },
        { status: 400 }
      );
    }

    // Auto generate ticket number
    const count = await Referral.countDocuments();
    const ticketNumber = `REF-${3215 + count}`;

    // Find or create patient record
    let finalPatientId = patientId;
    if (!finalPatientId) {
      let pat = await Patient.findOne({ phone: contactNumber.trim() });
      if (!pat) {
        pat = await Patient.create({
          name: patientName,
          phone: contactNumber,
          registeredBy: doctor._id,
          medicalHistory: diagnosis,
        });
      }
      finalPatientId = pat._id;
    }

    const referral = await Referral.create({
      ticketNumber,
      patientId: finalPatientId,
      patientName,
      contactNumber,
      referringDoctorId: doctor._id,
      receivingDoctorId,
      diagnosis,
      testName: testName || '',
      reasonForReferral,
      feedbackNotes: feedbackNotes || '',
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
      attachments: attachments || [],
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          note: 'Referral submitted by Dr. ' + doctor.name,
        },
      ],
    });

    // Notify receiving doctor
    await Notification.create({
      doctorId: receivingDoctorId,
      title: 'New Referral Received',
      message: `Dr. ${doctor.name} referred patient ${patientName} (${ticketNumber})`,
      type: 'referral_received',
      actionData: {
        referralId: referral._id.toString(),
        patientId: finalPatientId.toString(),
        senderDoctorId: doctor._id.toString(),
      },
      isRead: false,
    });

    const populated = await Referral.findById(referral._id)
      .populate('referringDoctorId', 'name specialization hospital avatar')
      .populate('receivingDoctorId', 'name specialization hospital avatar');

    return NextResponse.json(
      {
        success: true,
        message: 'Referral sent successfully',
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Referrals POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
