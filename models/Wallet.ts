import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWallet extends Document {
  user?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    balance: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WalletSchema.pre('save', function () {
  const self = this as any;
  if (self.user && !self.doctorId) self.doctorId = self.user;
  if (self.doctorId && !self.user) self.user = self.doctorId;
  if (self.availableBalance !== undefined && self.balance === undefined) self.balance = self.availableBalance;
  if (self.balance !== undefined && self.availableBalance === undefined) self.availableBalance = self.balance;
});

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
