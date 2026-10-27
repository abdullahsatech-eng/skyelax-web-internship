import { Category } from '../models/Category';
import { Supplier } from '../models/Supplier';

const CATEGORIES = [
  { name: 'Electronics', description: 'Devices, cables and accessories' },
  { name: 'Office Supplies', description: 'Stationery and everyday office items' },
  { name: 'Furniture', description: 'Desks, chairs and storage' },
  { name: 'Packaging', description: 'Boxes, tape and shipping materials' },
  { name: 'Cleaning Supplies', description: 'Cleaning and hygiene products' },
];

const SUPPLIERS = [
  { name: 'Apex Wholesale Ltd', email: 'sales@apex-wholesale.example', phone: '+92 300 0000001' },
  { name: 'Greenfield Supplies', email: 'orders@greenfield.example', phone: '+92 300 0000002' },
  { name: 'Metro Distribution Co', email: 'hello@metro-dist.example', phone: '+92 300 0000003' },
];

export interface SeedResult {
  categoriesCreated: number;
  suppliersCreated: number;
}

/**
 * Inserts reference data that does not exist yet. Existing records are matched by name and
 * left untouched ($setOnInsert only applies when a new document is created), so running this
 * repeatedly is safe and never overwrites or deletes anything.
 */
export async function seedReferenceData(): Promise<SeedResult> {
  let categoriesCreated = 0;
  for (const category of CATEGORIES) {
    const result = await Category.updateOne(
      { name: category.name },
      { $setOnInsert: category },
      { upsert: true },
    );
    categoriesCreated += result.upsertedCount;
  }

  let suppliersCreated = 0;
  for (const supplier of SUPPLIERS) {
    const result = await Supplier.updateOne(
      { name: supplier.name },
      { $setOnInsert: supplier },
      { upsert: true },
    );
    suppliersCreated += result.upsertedCount;
  }

  return { categoriesCreated, suppliersCreated };
}
