import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { conversationId } = params;

    await connectToDatabase();
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name specialization hospital avatar');

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: conversation.messages,
      conversation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { conversationId } = params;

    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text, attachmentUrl, attachmentType = 'image' } = body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Determine receiver doctor
    const receiverId = conversation.participants.find(
      (p: any) => p.toString() !== doctor._id.toString()
    );

    const newMessage: any = {
      senderId: doctor._id,
      receiverId: receiverId || doctor._id,
      text: text || '',
      attachmentUrl: attachmentUrl || '',
      attachmentType: attachmentType,
      isRead: false,
      createdAt: new Date(),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = text || (attachmentUrl ? 'Sent an attachment' : '');
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      data: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
