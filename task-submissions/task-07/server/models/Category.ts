import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Category = model('Category', categorySchema);
