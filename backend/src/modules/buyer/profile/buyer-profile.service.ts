/*eslint-disable*/
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
;

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

}