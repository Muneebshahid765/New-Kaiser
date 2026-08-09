/*eslint-disable*/
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
type  VerifyTwoFactorLoginDto,
 type VerifyTwoFactorSetupDto,
 type DisableTwoFactorDto,
  VerifyTwoFactorSetupSchema,
  VerifyTwoFactorLoginSchema,
  DisableTwoFactorSchema,
} from '../dto/two-factor.dto';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { loginSchema, type LoginDtoType } from '../dto/login.dto';
import { getAuthCookieOptions } from 'src/common/utils/auth-token.util';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}


@Post('login')
@Public()
async login(
  @Body(ZodValidationPipe.for(loginSchema)) dto: LoginDtoType,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.adminAuthService.login(dto, req);

  if ('token' in result) {
    const cookieOptions = getAuthCookieOptions(
      this.adminAuthService['config'],
      'ADMIN_COOKIE_EXPIRES_IN_DAYS',
    );

    res.cookie('admin_token', result.token, cookieOptions);
  }

  return result;
}

  // 1. SETUP (Private - Admin Only)
  @Post('setup')
  setupTwoFactor(@CurrentUser('id') userId: string) {
    return this.adminAuthService.setupTwoFactor(userId);
  }

  // 2. VERIFY SETUP (Private - Admin Only)
  @Post('verify')
  verifySetup(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(VerifyTwoFactorSetupSchema)) dto: VerifyTwoFactorSetupDto,
  ) {
    return this.adminAuthService.verifyAndEnableTwoFactor(userId, dto);
  }

  // 3. VERIFY LOGIN (Public - Temp Session Required)
  @Post('verify-login')
@Public()
async verifyLogin(
  @Body(ZodValidationPipe.for(VerifyTwoFactorLoginSchema))
  dto: VerifyTwoFactorLoginDto,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.adminAuthService.verifyLoginTwoFactor(dto, req);

  const cookieOptions = getAuthCookieOptions(
    this.adminAuthService['config'],
    'ADMIN_COOKIE_EXPIRES_IN_DAYS',
  );

  res.cookie('admin_token', result.token, cookieOptions);

  return result;
}

  // 4. DISABLE 2FA (Private - Admin Only, Requires Password + OTP)
  @Post('disable')
  disableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(DisableTwoFactorSchema)) dto: DisableTwoFactorDto,
  ) {
    return this.adminAuthService.disableTwoFactor(userId, dto);
  }

  // 5. STATUS (Private - Admin Only)
  @Get('status')
  getStatus(@CurrentUser('id') userId: string) {
    return this.adminAuthService.getTwoFactorStatus(userId);
  }

}