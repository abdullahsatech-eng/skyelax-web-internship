import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Supplier = model('Supplier', supplierSchema);
