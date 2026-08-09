/*eslint-disable*/
import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '465', 10),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  fromName: process.env.MAIL_FROM_NAME || 'AfricaKaiser',
  fromAddress: process.env.MAIL_FROM_ADDRESS || 'no-reply@yourdomain.com',

  // 👇 Naye fields — email header/footer design ke liye
  brandLogoUrl: process.env.BRAND_LOGO_URL || 'https://africakaiser.co.uk/favicon.png',
  frontendUrl: process.env.FRONTEND_URL || 'https://africakaiser.co.uk',
}));