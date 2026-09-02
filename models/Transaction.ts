import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  wallet?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  direction?: 'credit' | 'debit';
  transactionType?: 'Credit' | 'Debit';
  title?: string;
  description?: string;
  referenceId?: string;
  referenceModel?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    direction: { type: String, default: 'credit' },
    transactionType: { type: String, default: 'Credit' },
    title: { type: String, default: 'Transaction' },
    description: { type: String, default: '' },
    referenceId: { type: String, default: null },
    referenceModel: { type: String, default: null },
    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    status: { type: String, default: 'Completed' },
  },
  { timestamps: true }
);

TransactionSchema.pre('save', function () {
  const self = this as any;
  if (self.user && !self.doctorId) self.doctorId = self.user;
  if (self.doctorId && !self.user) self.user = self.doctorId;
  if (self.transactionType && !self.direction) {
    self.direction = self.transactionType.toLowerCase() as any;
  }
  if (self.direction && !self.transactionType) {
    self.transactionType = (self.direction.charAt(0).toUpperCase() + self.direction.slice(1)) as any;
  }
  if (!self.title) {
    self.title = self.description || self.type || 'Transaction';
  }
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const WalletTransaction = Transaction;
export default Transaction;
