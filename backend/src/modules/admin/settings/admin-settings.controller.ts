/*eslint-disable*/
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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AdminSettingsService } from './admin-settings.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AppRole, Roles } from 'src/common/decorators/roles.decorator';
import { UpdateThemeSchema, type UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateAdminProfileSchema, UpdateSecuritySettingsSchema, type UpdateAdminProfileDto, type UpdateSecuritySettingsDto } from './dto/update-profile.dto';
import { UpdateSiteWideDiscountSchema, type UpdateSiteWideDiscountDto } from './dto/update-discount.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { type UpdatePreferencesDto, UpdatePreferencesSchema } from './dto/update-preferences.dto';
import { type UpdateNotificationsDto, UpdateNotificationsSchema } from './dto/update-notifications.dto';
import { type ChangePasswordDto, ChangePasswordSchema } from 'src/modules/buyer/profile/dto/change-password.dto';


@UseGuards(RolesGuard)
@Roles(AppRole.ADMIN)
@Controller('settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  getSettings(@CurrentUser('id') userId: string) {
    return this.adminSettingsService.getSettings(userId);
  }

  @Put('profile')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateAdminProfileSchema)) dto: UpdateAdminProfileDto,
  ) {
    return this.adminSettingsService.updateProfile(userId, dto);
  }

  @Put('change-password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.adminSettingsService.changePassword(userId, dto);
  }

  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/profiles'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    }),
  )
  uploadProfilePicture(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminSettingsService.uploadProfilePicture(userId, file);
  }

  @Put('theme')
  updateTheme(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateThemeSchema)) dto: UpdateThemeDto,
  ) {
    return this.adminSettingsService.updateTheme(userId, dto);
  }

  @Put('security')
  updateSecurity(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateSecuritySettingsSchema)) dto: UpdateSecuritySettingsDto,
  ) {
    return this.adminSettingsService.updateSecurity(userId, dto);
  }

  @Put('site-wide-discount')
  updateSiteWideDiscount(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateSiteWideDiscountSchema)) dto: UpdateSiteWideDiscountDto,
  ) {
    return this.adminSettingsService.updateSiteWideDiscount(userId, dto);
  }

  @Put('preferences')
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdatePreferencesSchema)) dto: UpdatePreferencesDto,
  ) {
    return this.adminSettingsService.updatePreferences(userId, dto);
  }


  @Put('notifications')
updateNotifications(
  @CurrentUser('id') userId: string,
  @Body(ZodValidationPipe.for(UpdateNotificationsSchema)) dto: UpdateNotificationsDto,
) {
  return this.adminSettingsService.updateNotifications(userId, dto);
}

  @Public()
  @Get('public-discount')
  getPublicDiscount() {
    return this.adminSettingsService.getPublicDiscount();
  }

  @Get('activity-and-health')
getSystemActivityAndHealth(@CurrentUser('id') userId: string) {
  return this.adminSettingsService.getSystemActivityAndHealth(userId);
}

}