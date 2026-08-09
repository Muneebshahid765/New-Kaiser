/*eslint-disable*/
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CreateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class BuyerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to fetch Buyer Profile ID securely from User ID
  private async getBuyerProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Buyer profile not found.');
    return profile.id;
  }

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  // 1. Get Buyer Profile (Includes User Email & Role)
  async getProfile(userId: string) {
    const buyerProfile = await this.prisma.buyerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!buyerProfile) {
      throw new NotFoundException('Buyer profile not found.');
    }

    return buyerProfile;
  }

  // 2. Update Profile (firstName, lastName)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.getBuyerProfileId(userId);

    return this.prisma.buyerProfile.update({
      where: { userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
      },
    });
  }

  // 3. Change Password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // A. Compare current password
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // B. Ensure new password is not the same as current
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be the same as current password.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    return { message: 'Password changed successfully.' };
  }

  // ============================================================================
  // ADDRESS MANAGEMENT
  // ============================================================================

  // 4. Get All Addresses
  async getAddresses(userId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    return this.prisma.buyerAddress.findMany({
      where: { buyerProfileId },
      orderBy: { isDefault: 'desc' },
    });
  }

  // 5. Add Address (Limit Check)
  async addAddress(userId: string, dto: CreateAddressDto) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const existingCount = await this.prisma.buyerAddress.count({
      where: { buyerProfileId },
    });

    if (existingCount >= 5) { // Recommended 5 address limit
      throw new BadRequestException(
        'Address limit reached. Please update or delete existing addresses.',
      );
    }

    // First address becomes default automatically
    const isFirstAddress = existingCount === 0;

    return this.prisma.buyerAddress.create({
      data: {
        buyerProfileId,
        label: dto.label ?? 'Home',
        fullName: dto.fullName,
        phone: dto.phone,
        address1: dto.address1,
        address2: dto.address2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country ?? 'Pakistan',
        isDefault: isFirstAddress ? true : dto.isDefault ?? false,
      },
    });
  }

  // 6. Update Address
  async updateAddress(
    userId: string,
    addressId: string,
    dto: Partial<CreateAddressDto>,
  ) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findFirst({
      where: { id: addressId, buyerProfileId },
    });

    if (!address) {
      throw new NotFoundException('Address not found or unauthorized.');
    }

    if (dto.isDefault === true) {
      await this.prisma.buyerAddress.updateMany({
        where: { buyerProfileId },
        data: { isDefault: false },
      });
    }

    return this.prisma.buyerAddress.update({
      where: { id: addressId },
      data: { ...dto },
    });
  }

  // 7. Delete Address
  async deleteAddress(userId: string, addressId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findFirst({
      where: { id: addressId, buyerProfileId },
    });

    if (!address) {
      throw new NotFoundException('Address not found or unauthorized.');
    }

    await this.prisma.buyerAddress.delete({
      where: { id: addressId },
    });

    return this.getAddresses(userId);
  }

  // 8. Set Default Address
  async setDefaultAddress(userId: string, addressId: string) {
    const buyerProfileId = await this.getBuyerProfileId(userId);

    const address = await this.prisma.buyerAddress.findFirst({
      where: { id: addressId, buyerProfileId },
    });

    if (!address) {
      throw new NotFoundException('Address not found or unauthorized.');
    }

    // Transaction to safely update defaults
    await this.prisma.$transaction([
      this.prisma.buyerAddress.updateMany({
        where: { buyerProfileId },
        data: { isDefault: false },
      }),
      this.prisma.buyerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return this.getAddresses(userId);
  }
}