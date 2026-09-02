import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAccount extends Document {
  user?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode?: string;
  ifscOrRouting?: string;
  branchName?: string;
  accountType?: 'Savings' | 'Current';
  upiId?: string;
  isDefault: boolean;
  isVerified?: boolean;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  remarks?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    ifscCode: { type: String, uppercase: true, trim: true },
    ifscOrRouting: { type: String, default: '' },
    branchName: { type: String, default: '' },
    accountType: { type: String, enum: ['Savings', 'Current'], default: 'Savings' },
    upiId: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    remarks: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BankAccountSchema.pre('save', function () {
  const self = this as any;
  if (self.user && !self.doctorId) self.doctorId = self.user;
  if (self.doctorId && !self.user) self.user = self.doctorId;
  if (self.ifscCode && !self.ifscOrRouting) self.ifscOrRouting = self.ifscCode;
  if (self.ifscOrRouting && !self.ifscCode) self.ifscCode = self.ifscOrRouting;
});

export const BankAccount: Model<IBankAccount> =
  mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
export default BankAccount;
