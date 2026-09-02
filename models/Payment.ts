import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  coupon?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  purchaseType: 'NEW' | 'RENEW';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    purchaseType: { type: String, enum: ['NEW', 'RENEW'], default: 'NEW' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
