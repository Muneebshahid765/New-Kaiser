/* eslint-disable */
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminSettingsService } from './admin-settings.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AppRole, Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { UpdateThemeSchema, type UpdateThemeDto } from './dto/update-theme.dto';
import {
  UpdateAdminProfileSchema,
  UpdateSecuritySettingsSchema,
  type UpdateAdminProfileDto,
  type UpdateSecuritySettingsDto,
} from './dto/update-profile.dto';
import { UpdateSiteWideDiscountSchema, type UpdateSiteWideDiscountDto } from './dto/update-discount.dto';
import { UpdatePreferencesSchema, type UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsSchema, type UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ChangePasswordSchema, type ChangePasswordDto } from 'src/modules/buyer/profile/dto/change-password.dto';

@UseGuards(RolesGuard)
@Controller('settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  // GET /settings
  @Get()
  @Roles(AppRole.ADMIN)
  getSettings(@CurrentUser('id') userId: string) {
    return this.adminSettingsService.getSettings(userId);
  }

  // PUT /settings/profile
  @Put('profile')
  @Roles(AppRole.ADMIN)
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateAdminProfileSchema)) dto: UpdateAdminProfileDto,
  ) {
    return this.adminSettingsService.updateProfile(userId, dto);
  }

  // PUT /settings/change-password
  @Put('change-password')
  @Roles(AppRole.ADMIN)
  changePassword(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.adminSettingsService.changePassword(userId, dto);
  }

  // POST /settings/profile-picture
  // Uses memoryStorage so the buffer reaches ImageDedupService for WebP conversion + dedup
  @Post('profile-picture')
  @Roles(AppRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  uploadProfilePicture(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminSettingsService.uploadProfilePicture(userId, file);
  }

  // PUT /settings/theme
  @Put('theme')
  @Roles(AppRole.ADMIN)
  updateTheme(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateThemeSchema)) dto: UpdateThemeDto,
  ) {
    return this.adminSettingsService.updateTheme(userId, dto);
  }

  // PUT /settings/security
  @Put('security')
  @Roles(AppRole.ADMIN)
  updateSecurity(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateSecuritySettingsSchema)) dto: UpdateSecuritySettingsDto,
  ) {
    return this.adminSettingsService.updateSecurity(userId, dto);
  }

  // PUT /settings/site-wide-discount
  @Put('site-wide-discount')
  @Roles(AppRole.ADMIN)
  updateSiteWideDiscount(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateSiteWideDiscountSchema)) dto: UpdateSiteWideDiscountDto,
  ) {
    return this.adminSettingsService.updateSiteWideDiscount(userId, dto);
  }

  // PUT /settings/preferences
  @Put('preferences')
  @Roles(AppRole.ADMIN)
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdatePreferencesSchema)) dto: UpdatePreferencesDto,
  ) {
    return this.adminSettingsService.updatePreferences(userId, dto);
  }

  // PUT /settings/notifications
  @Put('notifications')
  @Roles(AppRole.ADMIN)
  updateNotifications(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateNotificationsSchema)) dto: UpdateNotificationsDto,
  ) {
    return this.adminSettingsService.updateNotifications(userId, dto);
  }

  // GET /settings/public-discount  — no auth
  @Public()
  @Get('public-discount')
  getPublicDiscount() {
    return this.adminSettingsService.getPublicDiscount();
  }

  // GET /settings/activity-and-health
  @Get('activity-and-health')
  @Roles(AppRole.ADMIN)
  getSystemActivityAndHealth(@CurrentUser('id') userId: string) {
    return this.adminSettingsService.getSystemActivityAndHealth(userId);
  }
}