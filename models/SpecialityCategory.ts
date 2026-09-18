import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpecialityCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialityCategorySchema = new Schema<ISpecialityCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Stethoscope' },
    image: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SpecialityCategorySchema.pre('validate', function () {
  const self = this as any;
  if (self.name && !self.slug) {
    self.slug = self.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export const SpecialityCategory: Model<ISpecialityCategory> =
  mongoose.models.SpecialityCategory ||
  mongoose.model<ISpecialityCategory>('SpecialityCategory', SpecialityCategorySchema);

export default SpecialityCategory;
