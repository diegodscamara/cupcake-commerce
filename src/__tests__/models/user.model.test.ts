import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserModel } from '@/models/user.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('UserModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await UserModel.findById('123');

      expect(result).toEqual(mockUser);
      expect(db.select).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await UserModel.findById('123');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '1234567890',
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([
            { ...newUser, createdAt: new Date(), updatedAt: new Date() },
          ]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await UserModel.create(newUser);

      expect(result).toMatchObject(newUser);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const updatedData = {
        fullName: 'Updated Name',
        phone: '9876543210',
      };

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: '123', ...updatedData }]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      const result = await UserModel.update('123', updatedData);

      expect(result).toMatchObject(updatedData);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
