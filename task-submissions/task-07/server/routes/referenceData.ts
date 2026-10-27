import { Router } from 'express';
import { Category } from '../models/Category';
import { Supplier } from '../models/Supplier';
import { asyncHandler } from '../utils/asyncHandler';

export const categoriesRouter = Router();
export const suppliersRouter = Router();

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({
      data: categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        ...(c.description ? { description: c.description } : {}),
      })),
    });
  }),
);

suppliersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const suppliers = await Supplier.find().sort({ name: 1 }).lean();
    res.json({
      data: suppliers.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        ...(s.email ? { email: s.email } : {}),
        ...(s.phone ? { phone: s.phone } : {}),
      })),
    });
  }),
);
