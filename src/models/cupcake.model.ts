import { db } from '@/lib/db';
import { cupcakes } from '@/lib/db/schema';
import { eq, and, like, or, desc, asc, sql } from 'drizzle-orm';
import type { Cupcake, NewCupcake } from '@/lib/db/schema';

export type SortOption =
  | 'name'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'rating';

export class CupcakeModel {
  static async findAll(
    activeOnly = true,
    options?: {
      limit?: number;
      offset?: number;
      sort?: SortOption;
    }
  ): Promise<Cupcake[]> {
    const baseQuery = activeOnly
      ? db.select().from(cupcakes).where(eq(cupcakes.isActive, true))
      : db.select().from(cupcakes);

    // Determine sort order
    let orderByClause;
    switch (options?.sort) {
      case 'name':
        orderByClause = asc(cupcakes.name);
        break;
      case 'price-asc':
        orderByClause = asc(cupcakes.price);
        break;
      case 'price-desc':
        orderByClause = desc(cupcakes.price);
        break;
      case 'newest':
        orderByClause = desc(cupcakes.createdAt);
        break;
      default:
        orderByClause = asc(cupcakes.name);
    }

    // Build query with sorting and pagination in one chain
    const query = baseQuery
      .orderBy(orderByClause)
      .limit(options?.limit ?? Number.MAX_SAFE_INTEGER)
      .offset(options?.offset ?? 0);

    return query;
  }

  static async count(activeOnly = true): Promise<number> {
    if (activeOnly) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(cupcakes)
        .where(eq(cupcakes.isActive, true));
      return Number(result[0]?.count || 0);
    }
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cupcakes);
    return Number(result[0]?.count || 0);
  }

  static async findById(id: string): Promise<Cupcake | null> {
    const result = await db
      .select()
      .from(cupcakes)
      .where(eq(cupcakes.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async findBySlug(slug: string): Promise<Cupcake | null> {
    const result = await db
      .select()
      .from(cupcakes)
      .where(eq(cupcakes.slug, slug))
      .limit(1);
    return result[0] || null;
  }

  static async findByCategory(
    categoryId: string,
    activeOnly = true,
    options?: {
      limit?: number;
      offset?: number;
      sort?: SortOption;
    }
  ): Promise<Cupcake[]> {
    let query = db.select().from(cupcakes);

    if (activeOnly) {
      query = query.where(
        and(eq(cupcakes.categoryId, categoryId), eq(cupcakes.isActive, true))
      ) as typeof query;
    } else {
      query = query.where(eq(cupcakes.categoryId, categoryId)) as typeof query;
    }

    // Apply sorting
    if (options?.sort) {
      switch (options.sort) {
        case 'name':
          query = query.orderBy(asc(cupcakes.name)) as typeof query;
          break;
        case 'price-asc':
          query = query.orderBy(asc(cupcakes.price)) as typeof query;
          break;
        case 'price-desc':
          query = query.orderBy(desc(cupcakes.price)) as typeof query;
          break;
        case 'newest':
          query = query.orderBy(desc(cupcakes.createdAt)) as typeof query;
          break;
        default:
          query = query.orderBy(asc(cupcakes.name)) as typeof query;
      }
    } else {
      query = query.orderBy(asc(cupcakes.name)) as typeof query;
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }

    return query;
  }

  static async countByCategory(
    categoryId: string,
    activeOnly = true
  ): Promise<number> {
    if (activeOnly) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(cupcakes)
        .where(
          and(eq(cupcakes.categoryId, categoryId), eq(cupcakes.isActive, true))
        );
      return Number(result[0]?.count || 0);
    }
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cupcakes)
      .where(eq(cupcakes.categoryId, categoryId));
    return Number(result[0]?.count || 0);
  }

  static async search(
    query: string,
    options?: {
      limit?: number;
      offset?: number;
      sort?: SortOption;
    }
  ): Promise<Cupcake[]> {
    const searchTerm = `%${query}%`;
    const baseQuery = db
      .select()
      .from(cupcakes)
      .where(
        and(
          eq(cupcakes.isActive, true),
          or(
            like(cupcakes.name, searchTerm),
            like(cupcakes.description || '', searchTerm)
          )
        )
      );

    // Determine sort order
    let orderByClause;
    switch (options?.sort) {
      case 'name':
        orderByClause = asc(cupcakes.name);
        break;
      case 'price-asc':
        orderByClause = asc(cupcakes.price);
        break;
      case 'price-desc':
        orderByClause = desc(cupcakes.price);
        break;
      case 'newest':
        orderByClause = desc(cupcakes.createdAt);
        break;
      default:
        orderByClause = asc(cupcakes.name);
    }

    // Build query with sorting and pagination in one chain
    const dbQuery = baseQuery
      .orderBy(orderByClause)
      .limit(options?.limit ?? Number.MAX_SAFE_INTEGER)
      .offset(options?.offset ?? 0);

    return dbQuery;
  }

  static async countSearch(query: string): Promise<number> {
    const searchTerm = `%${query}%`;
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cupcakes)
      .where(
        and(
          eq(cupcakes.isActive, true),
          or(
            like(cupcakes.name, searchTerm),
            like(cupcakes.description || '', searchTerm)
          )
        )
      );
    return Number(result[0]?.count || 0);
  }

  static async create(data: NewCupcake): Promise<Cupcake> {
    const result = await db.insert(cupcakes).values(data).returning();
    return result[0];
  }

  static async update(
    id: string,
    data: Partial<Omit<Cupcake, 'id' | 'createdAt'>>
  ): Promise<Cupcake> {
    const result = await db
      .update(cupcakes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cupcakes.id, id))
      .returning();
    return result[0];
  }
}
