import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Conversation from '@/models/Conversation';

export async function GET(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { conversationId } = params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email speciality specialization avatar profileImage');

    if (!conversation) {
      return jsonError('Conversation not found', 404);
    }

    const isParticipant = conversation.participants.some(
      (p: any) => (p._id || p).toString() === user!._id.toString()
    );

    if (!isParticipant && user!.userRole !== 'admin' && user!.role !== 'admin') {
      return jsonError('Unauthorized to access this conversation', 403);
    }

    const formattedMessages = conversation.messages.map((m: any) => ({
      id: m._id?.toString(),
      _id: m._id?.toString(),
      senderId: m.senderId?.toString(),
      receiverId: m.receiverId?.toString(),
      message: m.text,
      text: m.text,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      isRead: m.isRead,
      timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      createdAt: m.createdAt,
    }));

    return jsonSuccess(formattedMessages, 'Messages fetched successfully', 200, { data: formattedMessages });
  } catch (error: any) {
    console.error('Get Messages Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
