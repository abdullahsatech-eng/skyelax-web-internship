import { Schema, model } from 'mongoose';
import { MAX_PRICE_CENTS } from '../utils/money';

const isInteger = { validator: Number.isInteger, message: '{PATH} must be a whole number' };

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sku: { type: String, required: true, trim: true, uppercase: true, maxlength: 40, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    priceCents: { type: Number, required: true, min: 0, max: MAX_PRICE_CENTS, validate: isInteger },
    quantity: { type: Number, required: true, min: 0, max: 1_000_000_000, validate: isInteger },
  },
  { timestamps: true }, // createdAt + updatedAt, maintained by Mongoose on create and update
);

export const Product = model('Product', productSchema);
