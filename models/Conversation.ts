import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'video';
  isRead: boolean;
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  messages: IMessage[];
  referralId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    attachmentType: { type: String, enum: ['image', 'document', 'video'], default: 'image' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    messages: [MessageSchema],
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
  },
  { timestamps: true }
);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
