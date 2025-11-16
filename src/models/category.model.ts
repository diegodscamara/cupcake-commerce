import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Category, NewCategory } from '@/lib/db/schema';

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    return db.select().from(categories);
  }

  static async findById(id: string): Promise<Category | null> {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return result[0] || null;
  }

  static async create(data: NewCategory): Promise<Category> {
    const result = await db.insert(categories).values(data).returning();
    return result[0];
  }
}
