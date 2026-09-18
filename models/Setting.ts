import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  referralRewardType: 'percentage' | 'flat';
  referralPercentage: number;
  referralFlatAmount: number;
  minWithdrawalAmount: number;
  autoApproveReferrals: boolean;
  platformCommissionPercentage: number;
  updatedAt: Date;
  createdAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    referralRewardType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    referralPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    referralFlatAmount: {
      type: Number,
      default: 500,
      min: 0,
    },
    minWithdrawalAmount: {
      type: Number,
      default: 500,
      min: 0,
    },
    autoApproveReferrals: {
      type: Boolean,
      default: false,
    },
    platformCommissionPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
