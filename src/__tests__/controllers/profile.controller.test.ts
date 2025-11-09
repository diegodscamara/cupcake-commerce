import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileController } from '@/controllers/profile.controller';
import { UserModel } from '@/models/user.model';
import { AddressModel } from '@/models/address.model';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/user.model');
vi.mock('@/models/address.model');

describe('ProfileController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return existing user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '1234567890',
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const result = await ProfileController.getUserProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith('user-1');
    });

    it('should create user profile if not exists', async () => {
      const newUser = {
        id: 'user-1',
        email: '',
        fullName: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(UserModel.findById).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue(newUser as any);

      const result = await ProfileController.getUserProfile('user-1');

      expect(result).toEqual(newUser);
      expect(UserModel.create).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Updated Name',
        phone: '9876543210',
      };

      vi.mocked(UserModel.findById).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any);
      vi.mocked(UserModel.update).mockResolvedValue(updatedUser as any);

      const result = await ProfileController.updateProfile('user-1', {
        fullName: 'Updated Name',
        phone: '9876543210',
      });

      expect(result).toEqual(updatedUser);
      expect(UserModel.update).toHaveBeenCalledWith('user-1', {
        fullName: 'Updated Name',
        phone: '9876543210',
      });
    });

    it('should throw error when user not found', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      await expect(
        ProfileController.updateProfile('user-1', {
          fullName: 'Updated Name',
        })
      ).rejects.toThrow('User with id user-1 not found');
    });
  });

  describe('getUserAddresses', () => {
    it('should return user addresses', async () => {
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

      vi.mocked(AddressModel.findByUserId).mockResolvedValue(
        mockAddresses as any
      );

      const result = await ProfileController.getUserAddresses('user-1');

      expect(result).toEqual(mockAddresses);
      expect(AddressModel.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createAddress', () => {
    it('should create new address', async () => {
      const newAddress = {
        id: 'address-1',
        userId: 'user-1',
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
        isDefault: false,
      };

      vi.mocked(AddressModel.create).mockResolvedValue(newAddress as any);

      const result = await ProfileController.createAddress('user-1', {
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
      });

      expect(result).toEqual(newAddress);
      expect(AddressModel.create).toHaveBeenCalled();
    });
  });
});
