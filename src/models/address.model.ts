import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Address, NewAddress } from '@/lib/db/schema';

export class AddressModel {
  static async findByUserId(userId: string): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  static async findById(id: string): Promise<Address | null> {
    const result = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async findDuplicate(
    userId: string,
    street: string,
    city: string,
    state: string,
    zipCode: string
  ): Promise<Address | null> {
    const normalizedZipCode = zipCode.replace(/\D/g, '');
    const userAddresses = await this.findByUserId(userId);

    const duplicate = userAddresses.find((addr) => {
      const addrZipCode = addr.zipCode.replace(/\D/g, '');
      return (
        addr.street.toLowerCase().trim() === street.toLowerCase().trim() &&
        addr.city.toLowerCase().trim() === city.toLowerCase().trim() &&
        addr.state.toUpperCase().trim() === state.toUpperCase().trim() &&
        addrZipCode === normalizedZipCode
      );
    });

    return duplicate || null;
  }

  static async create(data: NewAddress): Promise<Address> {
    const result = await db.insert(addresses).values(data).returning();
    return result[0];
  }

  static async update(
    id: string,
    data: Partial<Omit<Address, 'id' | 'createdAt'>>
  ): Promise<Address> {
    const result = await db
      .update(addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }
}
