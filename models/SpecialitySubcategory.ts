import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpecialitySubcategory extends Document {
  name: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialitySubcategorySchema = new Schema<ISpecialitySubcategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'SpecialityCategory', required: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Stethoscope' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SpecialitySubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

SpecialitySubcategorySchema.pre('validate', function () {
  const self = this as any;
  if (self.name && !self.slug) {
    self.slug = self.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export const SpecialitySubcategory: Model<ISpecialitySubcategory> =
  mongoose.models.SpecialitySubcategory ||
  mongoose.model<ISpecialitySubcategory>('SpecialitySubcategory', SpecialitySubcategorySchema);

export default SpecialitySubcategory;
