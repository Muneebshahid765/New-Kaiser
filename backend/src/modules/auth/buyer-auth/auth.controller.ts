/* eslint-disable */
import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpCode, HttpStatus, UnauthorizedException, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BuyerAuthService } from './auth.service';

import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { type BuyerRegisterDto, buyerRegisterSchema } from '../dto/register.dto';
import { Throttle } from '@nestjs/throttler';
import { type ForgotPasswordDto, forgotPasswordSchema, type ResendVerificationDto, resendVerificationSchema, type ResetPasswordDto, ResetPasswordSchema, type VerifyEmailDto, verifyEmailSchema } from '../dto/auth.dto';
import { getAuthCookieOptions } from 'src/common/utils/auth-token.util';
import { type LoginDtoType, loginSchema } from '../dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';


@Controller("buyer/auth")
export class BuyerAuthController{
    constructor (private buyerAuthService : BuyerAuthService){}

    @Post("register")
    @Public()
     @HttpCode(HttpStatus.OK)
    register(@Body(ZodValidationPipe.for(buyerRegisterSchema)) dto : BuyerRegisterDto ){
        return this.buyerAuthService.registration(dto)
    }

 @Post('verify-email')
 @Public()
  @HttpCode(HttpStatus.OK)
@Throttle({ default: { limit: 5, ttl: 900000 } })
async verifyEmail(@Body(ZodValidationPipe.for(verifyEmailSchema)) dto: VerifyEmailDto) {
  return this.buyerAuthService.verifyEmail(dto);
}

@Post('resend-verification-code')
@Public()
@HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body(ZodValidationPipe.for(resendVerificationSchema)) dto: ResendVerificationDto,
  ) {
    return this.buyerAuthService.resendVerificationCode(dto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(ZodValidationPipe.for(forgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.buyerAuthService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(ZodValidationPipe.for(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.buyerAuthService.resetPassword(dto);
  }

  @Get('verify-reset-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Query('token') token: string) {
    return this.buyerAuthService.verifyPasswordResetLink(token);
  }


  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ZodValidationPipe.for(loginSchema)) dto: LoginDtoType,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.buyerAuthService.login(dto, req);

    // Cookie Options (Secure HTTP-Only Cookie)
    const cookieOptions = getAuthCookieOptions(
      this.buyerAuthService['config'],
      'BUYER_COOKIE_EXPIRES_IN_DAYS',
    );

    res.cookie('buyer_token', result.token, cookieOptions);

    return {
      message: 'Login successful',
      buyer: result.buyer,
      token: result.token,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Cookie Clear 
    res.clearCookie('buyer_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }

 @Get('me')
getProfile(@CurrentUser() user: any) {
  return {
    success: true,
    message: 'Session active',
    data: {
      id: user.id,
      email: user.email,
      role: user.role,

      displayName:
        user.role === 'admin'
          ? user.adminProfile?.name
          : `${user.buyerProfile?.firstName} ${user.buyerProfile?.lastName}`,

      // 👇 CHANGE: was `user.adminSettings?.profilePicture` — that field
      // doesn't exist on the object at all (AdminSettings isn't a direct
      // relation on User). JwtStrategy now nests it under
      // adminProfile.settings, so read it from there instead.
      avatar:
        user.role === 'admin'
          ? user.adminProfile?.settings?.profilePicture ?? null
          : null,
    },
  };
}


}