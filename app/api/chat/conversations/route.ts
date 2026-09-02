import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Conversation from '@/models/Conversation';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const conversations = await Conversation.find({
      participants: user!._id,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('participants', 'name email speciality specialization avatar profileImage');

    return jsonSuccess(conversations, 'Conversations fetched successfully', 200, { data: conversations });
  } catch (error: any) {
    console.error('Get Conversations Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
