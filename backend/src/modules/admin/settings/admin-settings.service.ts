/*eslint-disable*/
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import {UpdateAdminProfileDto, UpdateSecuritySettingsDto } from './dto/update-profile.dto';
import { UpdateSiteWideDiscountDto } from './dto/update-discount.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ChangePasswordDto } from 'src/modules/buyer/profile/dto/change-password.dto';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}


private async logAdminAction(adminProfileId: string, actionDescription: string) {
    await this.prisma.adminProfile.update({
      where: { id: adminProfileId },
      data: {
        lastAction: actionDescription.substring(0, 150), // Schema length limit: 150
        lastActionAt: new Date(),
      },
    });
  }


  // ============================================================================
  // HELPER: Get or Create AdminSettings linked with AdminProfile
  // ============================================================================
  private async getOrCreateSettings(adminProfileId: string) {
    let settings = await this.prisma.adminSettings.findUnique({
      where: { adminProfileId },
    });

    if (!settings) {
      settings = await this.prisma.adminSettings.create({
        data: { adminProfileId },
      });
    }

    return settings;
  }

  // ============================================================================
  // 1. GET ALL ADMIN SETTINGS & PROFILE
  // ============================================================================
  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: {
          include: { settings: true },
        },
      },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin profile not found');
    }

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    return {
      success: true,
      data: {
        id: settings.id,
        twoFactorEnabled: user.adminProfile.twoFactorEnabled,
        profile: {
          name: user.adminProfile.name,
          email: user.email,
          profilePicture: settings.profilePicture,
        },
        preferences: {
          currency: settings.prefCurrency,
          language: settings.prefLanguage,
          timezoneAuto: settings.prefTimezoneAuto,
          timezoneManual: settings.prefTimezoneManual,
          dateFormat: settings.prefDateFormat,
        },
        notifications: {
          emailAlerts: settings.notifEmailAlerts,
          orderAlerts: settings.notifOrderAlerts,
          lowStockAlerts: settings.notifLowStockAlerts,
          customerAlerts: settings.notifCustomerAlerts,
          systemAlerts: settings.notifSystemAlerts,
        },
        theme: {
          mode: settings.themeMode,
          sidebarCollapsed: settings.themeSidebarCollapsed,
        },
        security: {
          twoFactorEnabled: user.adminProfile.twoFactorEnabled,
          sessionTimeoutMin: settings.securitySessionTimeoutMin,
          lastPasswordChange: user.lastPasswordChange,
        },
        siteWideDiscount: {
          enabled: settings.discountEnabled,
          percentage: settings.discountPercentage,
          bannerText: settings.discountBannerText,
          startDate: settings.discountStartDate,
          endDate: settings.discountEndDate,
        },
      },
    };
  }

  // ============================================================================
  // 2. UPDATE PROFILE (Name / Email)
  // ============================================================================
  async updateProfile(userId: string, dto: UpdateAdminProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin profile not found');
    }

    // Check duplicate email
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existingUser) {
        throw new ConflictException('Email address is already in use');
      }
    }

    // Transaction for atomic update across User, AdminProfile, and AdminSettings
    await this.prisma.$transaction(async (tx) => {
      if (dto.email || dto.name) {
        await tx.user.update({
          where: { id: userId },
          data: { email: dto.email ? dto.email.toLowerCase() : undefined },
        });
      }

      if (dto.name) {
        await tx.adminProfile.update({
          where: { id: user.adminProfile?.id },
          data: { name: dto.name },
        });
      }

      const settings = await this.getOrCreateSettings(user.adminProfile!.id);
      await tx.adminSettings.update({
        where: { id: settings.id },
        data: {
          profileName: dto.name || settings.profileName,
          profileEmail: dto.email ? dto.email.toLowerCase() : settings.profileEmail,
        },
      });
    });

    return { success: true, message: 'Profile updated successfully' };
  }

  // ============================================================================
  // 3. CHANGE PASSWORD
  // ============================================================================
  async changePassword(userId: string, dto: ChangePasswordDto) {
      const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: { adminProfile: true },
});
  
if (!user || !user.adminProfile) {
  throw new NotFoundException('Admin profile not found');
}

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect current password');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    const now = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        lastPasswordChange: now,
      },
    });

    await this.logAdminAction(user.adminProfile?.id, 'Changed admin account password');
    return { success: true, message: 'Password changed successfully' };
  }

  // ============================================================================
  // 4. UPLOAD PROFILE PICTURE
  // ============================================================================
  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) throw new NotFoundException('Admin profile not found');

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    // Delete existing old profile picture if exists
    if (settings.profilePicture) {
      const relativePath = settings.profilePicture.replace(/^\//, '');
      const oldPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const pictureUrl = `/uploads/profiles/${file.filename}`;

    await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: { profilePicture: pictureUrl },
    });

    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profilePicture: pictureUrl },
    };
  }

  // ============================================================================
  // 5. UPDATE THEME SETTINGS
  // ============================================================================
  async updateTheme(userId: string, dto: UpdateThemeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) throw new NotFoundException('Admin profile not found');

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    const updatedSettings = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        themeMode: dto.mode ?? settings.themeMode,
        themeSidebarCollapsed: dto.sidebarCollapsed ?? settings.themeSidebarCollapsed,
      },
    });

    return {
      success: true,
      message: 'Theme settings updated successfully',
      data: {
        mode: updatedSettings.themeMode,
        sidebarCollapsed: updatedSettings.themeSidebarCollapsed,
      },
    };
  }

  // ============================================================================
  // 6. UPDATE SECURITY SETTINGS
  // ============================================================================
  async updateSecurity(userId: string, dto: UpdateSecuritySettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) throw new NotFoundException('Admin profile not found');

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        securitySessionTimeoutMin: dto.sessionTimeoutMin ?? settings.securitySessionTimeoutMin,
      },
    });
    await this.logAdminAction(user.adminProfile.id, 'Updated security settings (Session Timeout)');
    return { success: true, message: 'Security settings updated successfully' };
  }

  // ============================================================================
  // 7. UPDATE SITE-WIDE DISCOUNT
  // ============================================================================
  async updateSiteWideDiscount(userId: string, dto: UpdateSiteWideDiscountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) throw new NotFoundException('Admin profile not found');

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    const updated = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        discountEnabled: dto.enabled ?? settings.discountEnabled,
        discountPercentage: dto.percentage !== undefined ? dto.percentage : settings.discountPercentage,
        discountBannerText: dto.bannerText ?? settings.discountBannerText,
        discountStartDate: dto.startDate ? new Date(dto.startDate) : dto.startDate === null ? null : settings.discountStartDate,
        discountEndDate: dto.endDate ? new Date(dto.endDate) : dto.endDate === null ? null : settings.discountEndDate,
      },
    });
    await this.logAdminAction(user.adminProfile.id, `Updated site-wide discount (Enabled: ${dto.enabled ?? 'unchanged'})`);
    return {
      success: true,
      message: 'Site-wide discount updated successfully',
      data: {
        enabled: updated.discountEnabled,
        percentage: updated.discountPercentage,
        bannerText: updated.discountBannerText,
        startDate: updated.discountStartDate,
        endDate: updated.discountEndDate,
      },
    };
  }


  // ============================================================================
  // FEATURE 1: UPDATE PREFERENCES (Currency, Language, Timezone, Date Format)
  // ============================================================================
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin profile not found');
    }

    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    const updatedSettings = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        prefCurrency: dto.prefCurrency ?? settings.prefCurrency,
        prefLanguage: dto.prefLanguage ?? settings.prefLanguage,
        prefTimezoneAuto: dto.prefTimezoneAuto ?? settings.prefTimezoneAuto,
        prefTimezoneManual: dto.prefTimezoneManual ?? settings.prefTimezoneManual,
        prefDateFormat: dto.prefDateFormat ?? settings.prefDateFormat,
      },
    });

    // Track Action in Audit Log
    await this.logAdminAction(user.adminProfile.id, 'Updated system preferences (Currency/Timezone/Language)');

    return {
      success: true,
      message: 'Preferences updated successfully',
      data: {
        prefCurrency: updatedSettings.prefCurrency,
        prefLanguage: updatedSettings.prefLanguage,
        prefTimezoneAuto: updatedSettings.prefTimezoneAuto,
        prefTimezoneManual: updatedSettings.prefTimezoneManual,
        prefDateFormat: updatedSettings.prefDateFormat,
      },
    };
  }


  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { adminProfile: true },
  });

  if (!user || !user.adminProfile) throw new NotFoundException('Admin profile not found');

  const settings = await this.getOrCreateSettings(user.adminProfile.id);

  const updated = await this.prisma.adminSettings.update({
    where: { id: settings.id },
    data: {
      notifEmailAlerts: dto.emailAlerts ?? settings.notifEmailAlerts,
      notifOrderAlerts: dto.orderAlerts ?? settings.notifOrderAlerts,
      notifLowStockAlerts: dto.lowStockAlerts ?? settings.notifLowStockAlerts,
      notifCustomerAlerts: dto.customerAlerts ?? settings.notifCustomerAlerts,
      notifSystemAlerts: dto.systemAlerts ?? settings.notifSystemAlerts,
    },
  });

  await this.logAdminAction(user.adminProfile.id, 'Updated notification alert preferences');

  return {
    success: true,
    message: 'Notification preferences updated successfully',
    data: {
      emailAlerts: updated.notifEmailAlerts,
      orderAlerts: updated.notifOrderAlerts,
      lowStockAlerts: updated.notifLowStockAlerts,
      customerAlerts: updated.notifCustomerAlerts,
      systemAlerts: updated.notifSystemAlerts,
    },
  };
}


  // ============================================================================
  // 8. PUBLIC DISCOUNT ENDPOINT
  // ============================================================================
  async getPublicDiscount() {
    const settings = await this.prisma.adminSettings.findFirst({
      where: { discountEnabled: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      return {
        success: true,
        data: { enabled: false, percentage: 0, bannerText: '', startDate: null, endDate: null },
      };
    }

    const now = new Date();
    const isStartValid = !settings.discountStartDate || now >= settings.discountStartDate;
    const isEndValid = !settings.discountEndDate || now <= settings.discountEndDate;
    const isActive = settings.discountEnabled && isStartValid && isEndValid;

    return {
      success: true,
      data: {
        enabled: isActive,
        percentage: isActive ? settings.discountPercentage : 0,
        bannerText: isActive ? settings.discountBannerText : '',
        startDate: settings.discountStartDate,
        endDate: settings.discountEndDate,
      },
    };
  }

  async getSystemActivityAndHealth(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { adminProfile: true },
  });

  if (!user || !user.adminProfile) {
    throw new NotFoundException('Admin profile not found');
  }

  // Fetch recent admin actions from notification/audit log
  const recentNotifications = await this.prisma.adminNotification.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  return {
    success: true,
    data: {
      recentActions: [
        { id: '1', action: user.adminProfile.lastAction || 'Updated System Settings', timestamp: user.adminProfile.lastActionAt },
        ...recentNotifications.map(n => ({ id: n.id, action: n.title, timestamp: n.createdAt })),
      ].slice(0, 5),
      systemStatus: {
        database: 'Connected',
        paymentGateway: 'Connected',
        emailService: 'Active',
      },
    },
  };
}

}