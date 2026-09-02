import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Conversation from '@/models/Conversation';

export async function PUT(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { conversationId } = params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return jsonError('Conversation not found', 404);
    }

    let changed = false;
    conversation.messages.forEach((m: any) => {
      if (m.receiverId?.toString() === user!._id.toString() && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });

    if (changed) {
      await conversation.save();
    }

    return jsonSuccess(null, 'Messages marked as read', 200);
  } catch (error: any) {
    console.error('Mark Read Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
