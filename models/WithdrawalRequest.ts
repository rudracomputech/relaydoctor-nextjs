import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  user?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  wallet?: mongoose.Types.ObjectId;
  amount: number;
  bankAccount?: mongoose.Types.ObjectId;
  bankAccountId?: mongoose.Types.ObjectId;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  status: string;
  adminNote?: string;
  remarks?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  completedAt?: Date;
  processedAt?: Date;
  payoutId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    amount: { type: Number, required: true },
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    status: {
      type: String,
      default: 'Pending',
    },
    adminNote: { type: String, default: '' },
    remarks: { type: String, default: '' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    completedAt: { type: Date },
    processedAt: { type: Date },
    payoutId: { type: String },
  },
  { timestamps: true }
);

WithdrawalRequestSchema.pre('save', function () {
  const self = this as any;
  if (self.user && !self.doctorId) self.doctorId = self.user;
  if (self.doctorId && !self.user) self.user = self.doctorId;
  if (self.bankAccount && !self.bankAccountId) self.bankAccountId = self.bankAccount;
  if (self.bankAccountId && !self.bankAccount) self.bankAccount = self.bankAccountId;
  if (self.remarks && !self.adminNote) self.adminNote = self.remarks;
  if (self.adminNote && !self.remarks) self.remarks = self.adminNote;
});

export const WithdrawalRequest: Model<IWithdrawalRequest> =
  mongoose.models.WithdrawalRequest ||
  mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
export const WithdrawRequest = WithdrawalRequest;
export default WithdrawalRequest;
