import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctorSubscription extends Document {
  doctorId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  billingCycle: 'monthly' | 'annually';
  amount: number;
  discountApplied: number;
  couponCode?: string;
  paymentMethod?: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSubscriptionSchema = new Schema<IDoctorSubscription>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    billingCycle: { type: String, enum: ['monthly', 'annually'], default: 'annually' },
    amount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    paymentMethod: { type: String, default: 'UPI' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DoctorSubscription: Model<IDoctorSubscription> =
  mongoose.models.DoctorSubscription ||
  mongoose.model<IDoctorSubscription>('DoctorSubscription', DoctorSubscriptionSchema);
export default DoctorSubscription;
