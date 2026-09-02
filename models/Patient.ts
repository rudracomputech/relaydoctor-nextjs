import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  phone?: string;
  mobile?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'male' | 'female' | 'other';
  doctorId?: mongoose.Types.ObjectId;
  registeredBy?: mongoose.Types.ObjectId;
  medicalHistory?: string;
  problem?: string;
  diagnosis?: string;
  prescription?: string;
  address?: string;
  visitDate?: Date;
  emergencyContact?: string;
  pastVisits?: Array<{
    date?: Date;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    age: { type: Number, default: 35 },
    gender: { type: String, default: 'male' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    medicalHistory: { type: String, default: '' },
    problem: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    prescription: { type: String, default: '' },
    address: { type: String, default: '' },
    visitDate: { type: Date, default: Date.now },
    emergencyContact: { type: String, default: '' },
    pastVisits: [
      {
        date: { type: Date, default: Date.now },
        diagnosis: String,
        prescription: String,
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

PatientSchema.pre('save', function () {
  const self = this as any;
  if (self.mobile && !self.phone) self.phone = self.mobile;
  if (self.phone && !self.mobile) self.mobile = self.phone;
  if (self.doctorId && !self.registeredBy) self.registeredBy = self.doctorId;
  if (self.registeredBy && !self.doctorId) self.doctorId = self.registeredBy;
  if (self.problem && !self.medicalHistory) self.medicalHistory = self.problem;
  if (self.medicalHistory && !self.problem) self.problem = self.medicalHistory;
});

export const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;
