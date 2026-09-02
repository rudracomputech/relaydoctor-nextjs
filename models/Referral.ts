import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  ticketNumber?: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  contactNumber?: string;
  patientContact?: string;
  fromDoctor?: mongoose.Types.ObjectId;
  toDoctor?: mongoose.Types.ObjectId;
  referringDoctorId?: mongoose.Types.ObjectId;
  receivingDoctorId?: mongoose.Types.ObjectId;
  diagnosis?: string;
  professionalDiagnosis?: string;
  testName?: string;
  reasonForReferral: string;
  feedback?: string;
  feedbackNotes?: string;
  nextFollowUpDate?: Date;
  attachment?: string | null;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'declined' | 'in_progress' | 'completed';
  referralTime?: Date;
  lastUpdated?: Date;
  statusHistory?: Array<{
    status: string;
    changedAt: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    ticketNumber: { type: String, unique: true, sparse: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    patientName: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
    patientContact: { type: String, trim: true },
    fromDoctor: { type: Schema.Types.ObjectId, ref: 'User' },
    toDoctor: { type: Schema.Types.ObjectId, ref: 'User' },
    referringDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    receivingDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    diagnosis: { type: String, default: '' },
    professionalDiagnosis: { type: String, default: '' },
    testName: { type: String, default: '' },
    reasonForReferral: { type: String, required: true },
    feedback: { type: String, default: '' },
    feedbackNotes: { type: String, default: '' },
    nextFollowUpDate: { type: Date },
    attachment: { type: String, default: null },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'declined', 'in_progress', 'completed'],
      default: 'pending',
    },
    referralTime: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

ReferralSchema.pre('save', function () {
  const self = this as any;
  if (!self.ticketNumber) {
    self.ticketNumber = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (self.fromDoctor && !self.referringDoctorId) self.referringDoctorId = self.fromDoctor;
  if (self.referringDoctorId && !self.fromDoctor) self.fromDoctor = self.referringDoctorId;
  if (self.toDoctor && !self.receivingDoctorId) self.receivingDoctorId = self.toDoctor;
  if (self.receivingDoctorId && !self.toDoctor) self.toDoctor = self.receivingDoctorId;
  if (self.patientContact && !self.contactNumber) self.contactNumber = self.patientContact;
  if (self.contactNumber && !self.patientContact) self.patientContact = self.contactNumber;
  if (self.professionalDiagnosis && !self.diagnosis) self.diagnosis = self.professionalDiagnosis;
  if (self.diagnosis && !self.professionalDiagnosis) self.professionalDiagnosis = self.diagnosis;
  if (self.feedback && !self.feedbackNotes) self.feedbackNotes = self.feedback;
  if (self.feedbackNotes && !self.feedback) self.feedback = self.feedbackNotes;
  if (self.attachment && (!self.attachments || self.attachments.length === 0)) {
    self.attachments = [self.attachment];
  }
  if (!self.attachment && self.attachments && self.attachments.length > 0) {
    self.attachment = self.attachments[0];
  }
  self.lastUpdated = new Date();
});

export const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
export default Referral;
