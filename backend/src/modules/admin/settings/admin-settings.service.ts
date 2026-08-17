/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ImageDedupService } from 'src/modules/uploads/services/image.service';
import { ImageFolder, UsageModel } from '@prisma/client';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateAdminProfileDto, UpdateSecuritySettingsDto } from './dto/update-profile.dto';
import { UpdateSiteWideDiscountDto } from './dto/update-discount.dto';
import * as bcrypt from 'bcrypt';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ChangePasswordDto } from 'src/modules/buyer/profile/dto/change-password.dto';

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageDedupService,
  ) {}

  // ============================================================================
  // PRIVATE: Log admin action (last action only — no audit table bloat)
  // ============================================================================
  private async logAdminAction(adminProfileId: string, action: string): Promise<void> {
    await this.prisma.adminProfile.update({
      where: { id: adminProfileId },
      data: {
        lastAction: action.substring(0, 150),
        lastActionAt: new Date(),
      },
    });
  }

  // ============================================================================
  // PRIVATE: Get or create AdminSettings for a given adminProfileId
  // ============================================================================
  private async getOrCreateSettings(adminProfileId: string) {
    const existing = await this.prisma.adminSettings.findUnique({
      where: { adminProfileId },
    });
    if (existing) return existing;

    return this.prisma.adminSettings.create({
      data: { adminProfileId },
    });
  }

  // ============================================================================
  // PRIVATE: Resolve user + adminProfile, throw if missing
  // ============================================================================
  private async resolveAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin profile not found');
    }

    return user as typeof user & { adminProfile: NonNullable<typeof user.adminProfile> };
  }

  // ============================================================================
  // 1. GET ALL SETTINGS
  // ============================================================================
 // admin-settings.service.ts
async getSettings(userId: string) {
  const user = await this.resolveAdmin(userId);
  const settings = await this.getOrCreateSettings(user.adminProfile.id);

  // Return direct payload without outer `{ success: true, data: ... }`
  return {
    id: settings.id,
    twoFactorEnabled: user.adminProfile.twoFactorEnabled,
    profile: {
      name: user.adminProfile.name,
      email: user.email,
      profilePicture: settings.profilePicture ?? null,
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
      lastPasswordChange: user.lastPasswordChange ?? null,
    },
    siteWideDiscount: {
      enabled: settings.discountEnabled,
      percentage: Number(settings.discountPercentage),
      bannerText: settings.discountBannerText,
      startDate: settings.discountStartDate ?? null,
      endDate: settings.discountEndDate ?? null,
    },
  };
}

  // ============================================================================
  // 2. UPDATE PROFILE (name / email)
  // ============================================================================
  async updateProfile(userId: string, dto: UpdateAdminProfileDto) {
    const user = await this.resolveAdmin(userId);

    // Duplicate email guard
    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      if (normalizedEmail !== user.email.toLowerCase()) {
        const taken = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (taken) throw new ConflictException('Email address is already in use');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.email) {
        await tx.user.update({
          where: { id: userId },
          data: { email: dto.email!.trim().toLowerCase() },
        });
      }

      if (dto.name) {
        await tx.adminProfile.update({
          where: { id: user.adminProfile.id },
          data: { name: dto.name.trim() },
        });
      }
    });

    await this.logAdminAction(user.adminProfile.id, 'Updated profile (name/email)');

    return { success: true, message: 'Profile updated successfully' };
  }

  // ============================================================================
  // 3. CHANGE PASSWORD
  // ============================================================================
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.resolveAdmin(userId);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Incorrect current password');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        lastPasswordChange: new Date(),
      },
    });

    await this.logAdminAction(user.adminProfile.id, 'Changed account password');

    return { success: true, message: 'Password changed successfully' };
  }

  // ============================================================================
  // 4. UPLOAD PROFILE PICTURE (uses ImageDedupService — WebP + dedup)
  // ============================================================================
  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.resolveAdmin(userId);
    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    // Release old image asset if it exists
    if (settings.profilePicture) {
      await this.imageService
        .releaseImageRef(
          settings.profilePicture,
          UsageModel.profile,
          settings.id,
          'profilePicture',
        )
        .catch(() => null); // non-fatal if asset already gone
    }

    // Process + dedup via shared image service
    const { asset } = await this.imageService.processAndDedup(
      file.buffer,
      ImageFolder.profiles,
    );

    // Register usage
    await this.imageService.addUsageRef(
      asset.id,
      UsageModel.profile,
      settings.id,
      'profilePicture',
    );

    await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: { profilePicture: asset.path },
    });

    await this.logAdminAction(user.adminProfile.id, 'Updated profile picture');

    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profilePicture: asset.path },
    };
  }

  // ============================================================================
  // 5. UPDATE THEME
  // ============================================================================
  async updateTheme(userId: string, dto: UpdateThemeDto) {
    const user = await this.resolveAdmin(userId);
    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    const updated = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        themeMode: dto.mode ?? settings.themeMode,
        themeSidebarCollapsed: dto.sidebarCollapsed ?? settings.themeSidebarCollapsed,
      },
    });

    return {
      success: true,
      message: 'Theme updated successfully',
      data: {
        mode: updated.themeMode,
        sidebarCollapsed: updated.themeSidebarCollapsed,
      },
    };
  }

  // ============================================================================
  // 6. UPDATE SECURITY (session timeout only — 2FA managed by auth service)
  // ============================================================================
  async updateSecurity(userId: string, dto: UpdateSecuritySettingsDto) {
    const user = await this.resolveAdmin(userId);
    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        securitySessionTimeoutMin:
          dto.sessionTimeoutMin ?? settings.securitySessionTimeoutMin,
        // Keep mirror field in sync with AdminProfile truth
        securityTwoFactorEnabled: user.adminProfile.twoFactorEnabled,
      },
    });

    await this.logAdminAction(user.adminProfile.id, 'Updated security settings');

    return { success: true, message: 'Security settings updated successfully' };
  }

  // ============================================================================
  // 7. UPDATE SITE-WIDE DISCOUNT
  // ============================================================================
  async updateSiteWideDiscount(userId: string, dto: UpdateSiteWideDiscountDto) {
    const user = await this.resolveAdmin(userId);
    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    // Validate date range when both provided
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updated = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        discountEnabled: dto.enabled ?? settings.discountEnabled,
        discountPercentage:
          dto.percentage !== undefined ? dto.percentage : settings.discountPercentage,
        discountBannerText: dto.bannerText ?? settings.discountBannerText,
        discountStartDate:
          dto.startDate === null
            ? null
            : dto.startDate
              ? new Date(dto.startDate)
              : settings.discountStartDate,
        discountEndDate:
          dto.endDate === null
            ? null
            : dto.endDate
              ? new Date(dto.endDate)
              : settings.discountEndDate,
      },
    });

    await this.logAdminAction(
      user.adminProfile.id,
      `Updated site-wide discount — enabled: ${updated.discountEnabled}, ${Number(updated.discountPercentage)}%`,
    );

    return {
      success: true,
      message: 'Site-wide discount updated successfully',
      data: {
        enabled: updated.discountEnabled,
        percentage: Number(updated.discountPercentage),
        bannerText: updated.discountBannerText,
        startDate: updated.discountStartDate ?? null,
        endDate: updated.discountEndDate ?? null,
      },
    };
  }

  // ============================================================================
  // 8. UPDATE PREFERENCES
  // ============================================================================
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.resolveAdmin(userId);
    const settings = await this.getOrCreateSettings(user.adminProfile.id);

    const updated = await this.prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        prefCurrency: dto.prefCurrency ?? settings.prefCurrency,
        prefLanguage: dto.prefLanguage ?? settings.prefLanguage,
        prefTimezoneAuto: dto.prefTimezoneAuto ?? settings.prefTimezoneAuto,
        prefTimezoneManual: dto.prefTimezoneManual ?? settings.prefTimezoneManual,
        prefDateFormat: dto.prefDateFormat ?? settings.prefDateFormat,
      },
    });

    await this.logAdminAction(
      user.adminProfile.id,
      'Updated preferences (currency/language/timezone)',
    );

    return {
      success: true,
      message: 'Preferences updated successfully',
      data: {
        prefCurrency: updated.prefCurrency,
        prefLanguage: updated.prefLanguage,
        prefTimezoneAuto: updated.prefTimezoneAuto,
        prefTimezoneManual: updated.prefTimezoneManual,
        prefDateFormat: updated.prefDateFormat,
      },
    };
  }

  // ============================================================================
  // 9. UPDATE NOTIFICATIONS
  // ============================================================================
  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    const user = await this.resolveAdmin(userId);
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

    await this.logAdminAction(user.adminProfile.id, 'Updated notification preferences');

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
  // 10. PUBLIC DISCOUNT (no auth — storefront use)
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
    const startOk = !settings.discountStartDate || now >= settings.discountStartDate;
    const endOk = !settings.discountEndDate || now <= settings.discountEndDate;
    const isActive = settings.discountEnabled && startOk && endOk;

    return {
      success: true,
      data: {
        enabled: isActive,
        percentage: isActive ? Number(settings.discountPercentage) : 0,
        bannerText: isActive ? settings.discountBannerText : '',
        startDate: settings.discountStartDate ?? null,
        endDate: settings.discountEndDate ?? null,
      },
    };
  }

  // ============================================================================
  // 11. SYSTEM ACTIVITY & HEALTH
  // ============================================================================
// admin-settings.service.ts

async getSystemActivityAndHealth(userId: string) {
  const user = await this.resolveAdmin(userId);

  const recentNotifications = await this.prisma.adminNotification.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  const recentActions = [
    ...(user.adminProfile.lastAction
      ? [
          {
            id: 'last-action',
            action: user.adminProfile.lastAction,
            timestamp: user.adminProfile.lastActionAt ?? null,
          },
        ]
      : []),
    ...recentNotifications.map((n) => ({
      id: n.id,
      action: n.title,
      timestamp: n.createdAt,
    })),
  ].slice(0, 5);

  let dbStatus = 'Connected';
  try {
    await this.prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'Disconnected';
  }

  // Direct return karain — ResponseInterceptor isey khud wrap kar ley ga
  return {
    recentActions,
    systemStatus: {
      database: dbStatus,
      paymentGateway: 'Connected',
      emailService: 'Active',
    },
  };
}
}