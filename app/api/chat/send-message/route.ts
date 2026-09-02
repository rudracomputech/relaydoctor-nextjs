import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      receiverId,
      message,
      text,
      messageType = 'text',
      conversationId: providedConversationId,
      attachmentUrl,
    } = body;

    const messageContent = message || text;
    if (!messageContent && !attachmentUrl) {
      return jsonError('Message is required', 400);
    }

    let conversation: any = null;
    let finalReceiverId = receiverId;

    if (providedConversationId) {
      if (mongoose.Types.ObjectId.isValid(providedConversationId)) {
        conversation = await Conversation.findById(providedConversationId);
      }
      if (conversation) {
        finalReceiverId = conversation.participants.find(
          (p: any) => p.toString() !== user!._id.toString()
        );
      }
    }

    if (!conversation && finalReceiverId) {
      conversation = await Conversation.findOne({
        participants: { $all: [user!._id, finalReceiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [user!._id, finalReceiverId],
          messages: [],
        });
      }
    }

    if (!conversation) {
      return jsonError('Conversation not found or receiver ID required', 400);
    }

    const receiver = await User.findById(finalReceiverId);

    const newMessage: any = {
      _id: new mongoose.Types.ObjectId(),
      senderId: user!._id,
      receiverId: finalReceiverId || user!._id,
      text: messageContent || '',
      attachmentUrl: attachmentUrl || '',
      attachmentType: messageType === 'image' ? 'image' : 'document',
      isRead: false,
      createdAt: new Date(),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = messageContent || (attachmentUrl ? 'Attachment' : '');
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const messageData = {
      id: newMessage._id.toString(),
      _id: newMessage._id.toString(),
      conversationId: conversation._id.toString(),
      senderId: user!._id.toString(),
      receiverId: (finalReceiverId || user!._id).toString(),
      message: messageContent,
      text: messageContent,
      messageType,
      status: 'sent',
      isRead: false,
      senderName: user!.name,
      senderRole: user!.userRole || user!.role,
      receiverName: receiver ? receiver.name : '',
      receiverRole: receiver ? (receiver.userRole || receiver.role) : '',
      timestamp: Date.now(),
      createdAt: newMessage.createdAt,
    };

    return jsonSuccess(messageData, 'Message sent successfully', 201, { data: messageData });
  } catch (error: any) {
    console.error('Send Message Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
