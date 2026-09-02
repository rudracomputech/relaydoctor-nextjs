import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await Conversation.find({
      participants: doctor._id,
    })
      .populate('participants', 'name specialization hospital avatar')
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
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
    const { receiverDoctorId, referralId } = body;

    if (!receiverDoctorId) {
      return NextResponse.json({ error: 'receiverDoctorId is required' }, { status: 400 });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [doctor._id, receiverDoctorId] },
    }).populate('participants', 'name specialization hospital avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [doctor._id, receiverDoctorId],
        referralId,
        messages: [],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name specialization hospital avatar'
      );
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
