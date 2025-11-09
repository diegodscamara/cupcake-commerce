import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddressModel } from '@/models/address.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AddressModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return addresses for user', async () => {
      const mockAddresses = [
        {
          id: 'address-1',
          userId: 'user-1',
          street: '123 Main St',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '12345-678',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockAddresses),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await AddressModel.findByUserId('user-1');

      expect(result).toEqual(mockAddresses);
    });
  });

  describe('findById', () => {
    it('should return address when found', async () => {
      const mockAddress = {
        id: 'address-1',
        userId: 'user-1',
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAddress]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await AddressModel.findById('address-1');

      expect(result).toEqual(mockAddress);
    });

    it('should return null when address not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await AddressModel.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new address', async () => {
      const newAddress = {
        userId: 'user-1',
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
        isDefault: false,
      };

      const createdAddress = {
        id: 'address-1',
        ...newAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdAddress]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await AddressModel.create(newAddress);

      expect(result).toEqual(createdAddress);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update address', async () => {
      const updatedAddress = {
        id: 'address-1',
        street: '456 New St',
        updatedAt: new Date(),
      };

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedAddress]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      const result = await AddressModel.update('address-1', {
        street: '456 New St',
      });

      expect(result).toEqual(updatedAddress);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete address', async () => {
      const mockDelete = {
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.delete).mockReturnValue(mockDelete as any);

      await AddressModel.delete('address-1');

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
