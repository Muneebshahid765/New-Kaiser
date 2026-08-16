import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service'; // Adjust path accordingly
import {
  CreateBuyerAddressDto,
  UpdateBuyerAddressDto,
} from '../dto/buyer-address.dto';

@Injectable()
export class BuyerAddressService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper: Find buyer profile by user ID
  private async getBuyerProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Buyer profile not found for this user.');
    }

    return profile.id;
  }

  // 1. GET ALL ADDRESSES FOR BUYER
  async getAllAddresses(userId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const addresses = await this.prisma.buyerAddress.findMany({
      where: { buyerProfileId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      success: true,
      data: addresses,
    };
  }

  // 2. GET SINGLE ADDRESS BY ID
  async getAddressById(addressId: string, userId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.buyerProfileId !== buyerProfileId) {
      throw new ForbiddenException('You do not have access to this address');
    }

    return {
      success: true,
      data: address,
    };
  }

  // 3. CREATE NEW ADDRESS
  async createAddress(userId: string, dto: CreateBuyerAddressDto) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    return this.prisma.$transaction(async (tx) => {
      // Check if this is the user's first address
      const existingCount = await tx.buyerAddress.count({
        where: { buyerProfileId },
      });

      // If it's the first address or explicitly requested as default
      const shouldBeDefault = existingCount === 0 || dto.isDefault;

      if (shouldBeDefault) {
        await tx.buyerAddress.updateMany({
          where: { buyerProfileId },
          data: { isDefault: false },
        });
      }

      const address = await tx.buyerAddress.create({
        data: {
          ...dto,
          buyerProfileId,
          isDefault: shouldBeDefault,
        },
      });

      return {
        success: true,
        message: 'Address added successfully',
        data: address,
      };
    });
  }

  // 4. UPDATE ADDRESS
  async updateAddress(
    addressId: string,
    userId: string,
    dto: UpdateBuyerAddressDto,
  ) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.buyerProfileId !== buyerProfileId) {
      throw new ForbiddenException('You do not have permission to update this address');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.buyerAddress.updateMany({
          where: { buyerProfileId },
          data: { isDefault: false },
        });
      }

      const updatedAddress = await tx.buyerAddress.update({
        where: { id: addressId },
        data: dto,
      });

      return {
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress,
      };
    });
  }

  // 5. SET ADDRESS AS DEFAULT
  async setDefaultAddress(addressId: string, userId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.buyerProfileId !== buyerProfileId) {
      throw new ForbiddenException('You do not have permission to modify this address');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.buyerAddress.updateMany({
        where: { buyerProfileId },
        data: { isDefault: false },
      });

      const updatedAddress = await tx.buyerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return {
        success: true,
        message: 'Default address updated successfully',
        data: updatedAddress,
      };
    });
  }

  // 6. DELETE ADDRESS
  async deleteAddress(addressId: string, userId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.buyerProfileId !== buyerProfileId) {
      throw new ForbiddenException('You do not have permission to delete this address');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.buyerAddress.delete({
        where: { id: addressId },
      });

      // If deleted address was default, set the latest remaining address as default
      if (address.isDefault) {
        const remainingAddress = await tx.buyerAddress.findFirst({
          where: { buyerProfileId },
          orderBy: { createdAt: 'desc' },
        });

        if (remainingAddress) {
          await tx.buyerAddress.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return {
        success: true,
        message: 'Address deleted successfully',
      };
    });
  }
}