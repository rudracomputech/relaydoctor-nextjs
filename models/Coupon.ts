import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minimumAmount?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  maxUsageLimit?: number;
  usedCount?: number;
  usageCount?: number;
  expiryDate?: Date;
  validUntil?: Date;
  applicableTo?: 'all' | 'specific';
  assignedDoctors?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, default: 'Flat' },
    discountValue: { type: Number, required: true },
    minimumAmount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },
    maxUsageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    applicableTo: { type: String, enum: ['all', 'specific'], default: 'all' },
    assignedDoctors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiryDate: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.pre('save', function () {
  const self = this as any;
  if (self.minimumAmount !== undefined && self.minOrderAmount === undefined) self.minOrderAmount = self.minimumAmount;
  if (self.minOrderAmount !== undefined && self.minimumAmount === undefined) self.minimumAmount = self.minOrderAmount;
  if (self.usageLimit !== undefined && self.maxUsageLimit === undefined) self.maxUsageLimit = self.usageLimit;
  if (self.maxUsageLimit !== undefined && self.usageLimit === undefined) self.usageLimit = self.maxUsageLimit;
  if (self.usedCount !== undefined && self.usageCount === undefined) self.usageCount = self.usedCount;
  if (self.usageCount !== undefined && self.usedCount === undefined) self.usedCount = self.usageCount;
  if (self.expiryDate && !self.validUntil) self.validUntil = self.expiryDate;
  if (self.validUntil && !self.expiryDate) self.expiryDate = self.validUntil;
});

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
