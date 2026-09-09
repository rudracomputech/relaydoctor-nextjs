import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  mobile?: string;
  role: 'admin' | 'doctor' | 'staff' | 'user';
  userRole?: 'user' | 'doctor' | 'admin';
  specialization?: string;
  speciality?: string;
  hospital?: string;
  clinicAddress?: string;
  hospitalAddress?: string;
  dateOfBirth?: Date;
  experienceYears?: number;
  rating?: number;
  reviewCount?: number;
  avatar?: string;
  profileImage?: string;
  bio?: string;
  consultationFee?: number;
  isVerified: boolean;
  verified?: boolean;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  isBlocked?: boolean;
  availabilityStatus?: string;
  workSchedule?: {
    opdTiming?: string;
    opdDays?: string[];
    surgeryTiming?: string;
    surgeryDays?: string[];
  };
  documents?: {
    governmentId?: string;
    medicalCertificate?: string;
    degreeCertificate?: string;
  };
  documentVerification?: 'pending' | 'approved' | 'rejected' | null;
  documentRejectReason?: string;
  walletBalance: number;
  totalEarnings: number;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'doctor', 'staff', 'user'], default: 'doctor' },
    userRole: { type: String, enum: ['user', 'doctor', 'admin'], default: 'doctor' },
    specialization: { type: String, default: 'General Physician' },
    speciality: { type: String, default: 'General Physician' },
    hospital: { type: String, default: '' },
    clinicAddress: { type: String, default: '' },
    hospitalAddress: { type: String, default: '' },
    dateOfBirth: { type: Date },
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 120 },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face' },
    profileImage: { type: String, default: null },
    bio: { type: String, default: '' },
    consultationFee: { type: Number, default: 500 },
    isVerified: { type: Boolean, default: true },
    verified: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    availabilityStatus: {
      type: String,
      default: 'Available for Call or Online Consultation Only',
    },
    workSchedule: {
      opdTiming: { type: String, default: '' },
      opdDays: { type: [String], default: [] },
      surgeryTiming: { type: String, default: '' },
      surgeryDays: { type: [String], default: [] },
    },
    documents: {
      governmentId: { type: String, default: null },
      medicalCertificate: { type: String, default: null },
      degreeCertificate: { type: String, default: null },
    },
    documentVerification: {
      type: String,
      enum: ['pending', 'approved', 'rejected', null],
      default: null,
    },
    documentRejectReason: { type: String, default: '' },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Pre-save hook to keep aliases synchronized
UserSchema.pre('save', function () {
  const self = this as any;
  if (self.mobile && !self.phone) self.phone = self.mobile;
  if (self.phone && !self.mobile) self.mobile = self.phone;
  if (self.speciality && !self.specialization) self.specialization = self.speciality;
  if (self.specialization && !self.speciality) self.speciality = self.specialization;
  if (self.userRole && !self.role) self.role = self.userRole as any;
  if (self.role && !self.userRole && ['admin', 'doctor', 'user'].includes(self.role)) {
    self.userRole = self.role as any;
  }
  if (self.profileImage && !self.avatar) self.avatar = self.profileImage;
  if (self.avatar && !self.profileImage) self.profileImage = self.avatar;
  if (self.verified !== undefined && self.isVerified === undefined) self.isVerified = self.verified;
  if (self.isVerified !== undefined && self.verified === undefined) self.verified = self.isVerified;
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
