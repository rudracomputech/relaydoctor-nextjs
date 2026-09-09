import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
  patientId?: string;
  avatar?: string;
  name: string;
  phone?: string;
  mobile?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string;
  condition?: string;
  allergies?: string;
  caseStatus?: 'Under Treatment' | 'Recovered' | 'Discharged' | 'Critical' | 'Follow Up' | 'New Patient' | string;
  doctorId?: mongoose.Types.ObjectId;
  registeredBy?: mongoose.Types.ObjectId;
  medicalHistory?: string;
  medicalHistoryTags?: string[];
  problem?: string;
  diagnosis?: string;
  prescription?: string;
  address?: string;
  visitDate?: Date;
  emergencyContact?: string;
  reports?: Array<{
    name: string;
    url?: string;
    fileType?: string;
    uploadedAt?: Date;
  }>;
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
    patientId: { type: String, trim: true },
    avatar: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    age: { type: Number, default: 35 },
    gender: { type: String, default: 'male' },
    bloodGroup: { type: String, default: 'B+' },
    condition: { type: String, default: '' },
    allergies: { type: String, default: 'None' },
    caseStatus: {
      type: String,
      enum: ['Under Treatment', 'Recovered', 'Discharged', 'Critical', 'Follow Up', 'New Patient'],
      default: 'Under Treatment',
    },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    medicalHistory: { type: String, default: '' },
    medicalHistoryTags: { type: [String], default: [] },
    problem: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    prescription: { type: String, default: '' },
    address: { type: String, default: '' },
    visitDate: { type: Date, default: Date.now },
    emergencyContact: { type: String, default: '' },
    reports: [
      {
        name: { type: String, required: true },
        url: { type: String, default: '#' },
        fileType: { type: String, default: 'pdf' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
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
  if (!self.patientId) {
    self.patientId = `p-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  if (self.mobile && !self.phone) self.phone = self.mobile;
  if (self.phone && !self.mobile) self.mobile = self.phone;
  if (self.doctorId && !self.registeredBy) self.registeredBy = self.doctorId;
  if (self.registeredBy && !self.doctorId) self.doctorId = self.registeredBy;
  if (self.condition && !self.problem) self.problem = self.condition;
  if (self.problem && !self.condition) self.condition = self.problem;
  if (self.problem && !self.medicalHistory) self.medicalHistory = self.problem;
  if (self.medicalHistory && !self.problem) self.problem = self.medicalHistory;
  if (self.medicalHistory && (!self.medicalHistoryTags || self.medicalHistoryTags.length === 0)) {
    self.medicalHistoryTags = self.medicalHistory
      .split(/[,;]/)
      .map((t: string) => t.trim())
      .filter(Boolean);
  }
});

export const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;
