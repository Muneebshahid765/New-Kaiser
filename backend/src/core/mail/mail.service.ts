/*eslint-disable*/
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly templatesDir = path.resolve(__dirname, 'templates');
  
  // Compiled templates cache (Performance Optimization)
  private readonly compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private readonly configService: ConfigService) {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
      tls: {
        rejectUnauthorized: !isDev, // Dev mein relaxed, Prod mein strict
      },
    });
  }

  // NestJS Lifecycle Hook: App start hone par templates/partials load karega
  onModuleInit() {
    this.registerPartials();
     this.cacheTemplates();
  }

  private registerPartials() {
    const partialsDir = path.join(this.templatesDir, 'partials');

    if (!fs.existsSync(partialsDir)) {
      this.logger.warn(`⚠️ Partials directory missing: ${partialsDir}`);
      return;
    }

    const files = fs.readdirSync(partialsDir);
    let count = 0;

    for (const file of files) {
      if (!file.endsWith('.hbs')) continue;
      const name = path.basename(file, '.hbs');
      const source = fs.readFileSync(path.join(partialsDir, file), 'utf8');
      Handlebars.registerPartial(name, source);
      count++;
    }

    this.logger.log(`✅ Registered ${count} Handlebars partial(s).`);
  }

  private cacheTemplates() {
    if (!fs.existsSync(this.templatesDir)) {
      this.logger.error(`❌ Templates directory not found: ${this.templatesDir}`);
      return;
    }

    const files = fs.readdirSync(this.templatesDir);
    for (const file of files) {
      if (!file.endsWith('.hbs')) continue;
      const templateName = path.basename(file, '.hbs');
      const filePath = path.join(this.templatesDir, file);
      const source = fs.readFileSync(filePath, 'utf8');
      
      this.compiledTemplates.set(templateName, Handlebars.compile(source));
    }
  }

  private getDefaultContext() {
    return {
      brandName: this.configService.get<string>('mail.fromName'),
      brandLogo: this.configService.get<string>('mail.brandLogoUrl'),
      siteUrl: this.configService.get<string>('mail.frontendUrl'),
      supportEmail: this.configService.get<string>('mail.fromAddress'),
      currentYear: new Date().getFullYear(),
    };
  }

  private renderTemplate(templateName: string, context: Record<string, any>): string {
    const compiled = this.compiledTemplates.get(templateName);

    if (!compiled) {
      throw new Error(`Email template standard compiled cache mein nahi mila: ${templateName}`);
    }

    return compiled(context);
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const fullContext = { ...this.getDefaultContext(), ...options.context };
      const html = this.renderTemplate(options.template, fullContext);

      const fromName = this.configService.get<string>('mail.fromName');
      const fromAddress = this.configService.get<string>('mail.fromAddress');

      const mailData = {
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html,
      };

      const info = await this.transporter.sendMail(mailData);
      this.logger.log(`Email sent successfully to ${options.to} [Msg ID: ${info.messageId}]`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }
}