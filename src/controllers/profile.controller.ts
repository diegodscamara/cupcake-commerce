import { UserModel } from '@/models/user.model';
import { AddressModel } from '@/models/address.model';
import { NotFoundError, ValidationError } from '@/lib/errors';

export class ProfileController {
  static async getUserProfile(userId: string) {
    let user = await UserModel.findById(userId);
    if (!user) {
      // Create user record if doesn't exist
      user = await UserModel.create({
        id: userId,
        email: '', // Will be set from auth
        fullName: null,
        phone: null,
      });
    }
    return user;
  }

  static async updateProfile(
    userId: string,
    data: { fullName?: string; phone?: string }
  ) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User', userId);
    }

    return UserModel.update(userId, {
      fullName: data.fullName || null,
      phone: data.phone || null,
    });
  }

  static async getUserAddresses(userId: string) {
    return AddressModel.findByUserId(userId);
  }

  static async createAddress(
    userId: string,
    data: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      isDefault?: boolean;
    }
  ) {
    const duplicate = await AddressModel.findDuplicate(
      userId,
      data.street,
      data.city,
      data.state,
      data.zipCode
    );

    if (duplicate) {
      throw new ValidationError(
        'Este endereço já está cadastrado. Por favor, verifique seus endereços salvos.'
      );
    }

    return AddressModel.create({
      userId,
      ...data,
      isDefault: data.isDefault || false,
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await AddressModel.findById(addressId);
    if (!address) {
      throw new NotFoundError('Address', addressId);
    }

    if (address.userId !== userId) {
      throw new NotFoundError('Address', addressId);
    }

    await AddressModel.delete(addressId);
  }
}
