import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  slug?: string;
  price?: number;
  duration?: number;
  durationType?: 'Day' | 'Month' | 'Year';
  description?: string;
  badge?: string;
  tagline?: string;
  priceMonthly: number;
  priceAnnually: number;
  annualSavingsText?: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String },
    price: { type: Number },
    duration: { type: Number, default: 1 },
    durationType: { type: String, enum: ['Day', 'Month', 'Year'], default: 'Month' },
    description: { type: String, default: '' },
    badge: { type: String, default: 'Value Provider' },
    tagline: { type: String, default: 'Better care with priority access' },
    priceMonthly: { type: Number, default: 999 },
    priceAnnually: { type: Number, default: 9999 },
    annualSavingsText: { type: String, default: 'Save ₹1,200/year' },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubscriptionPlanSchema.pre('save', function () {
  const self = this as any;
  if (!self.slug && self.name) {
    self.slug = self.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (self.price === undefined) {
    self.price = self.priceMonthly || 999;
  }
  if (!self.priceMonthly && self.price) {
    self.priceMonthly = self.price;
  }
});

export const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
export default SubscriptionPlan;
