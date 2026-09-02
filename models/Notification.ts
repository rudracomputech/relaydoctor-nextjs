import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  doctorId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'referral_received' | 'referral_accepted' | 'patient_arrived' | 'payment_credited' | 'system';
  actionData?: {
    referralId?: string;
    patientId?: string;
    senderDoctorId?: string;
  };
  isRead: boolean;
  actionTaken?: 'accepted' | 'declined' | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['referral_received', 'referral_accepted', 'patient_arrived', 'payment_credited', 'system'],
      default: 'system',
    },
    actionData: {
      referralId: { type: String },
      patientId: { type: String },
      senderDoctorId: { type: String },
    },
    isRead: { type: Boolean, default: false },
    actionTaken: { type: String, default: null },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
