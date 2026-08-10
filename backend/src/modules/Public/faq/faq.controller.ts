import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import { FaqsService } from './faq.service';
import {
  createFaqSchema,
  updateFaqSchema,
 type CreateFaqDto,
 type UpdateFaqDto,
} from '../dto/faq.dto';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  // ─── PUBLIC ENDPOINTS ───────────────────────────────────────────────────────

  @Public()
  @Get()
  async getPublicFaqs() {
    return this.faqsService.getActiveFaqs();
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────
  @Public()
  @Get('admin/all')
  // Add @UseGuards(JwtAuthGuard, RolesGuard) if auth required
  async getAllFaqsAdmin() {
    return this.faqsService.getAllFaqs();
  }

  @Get(':id')
  async getFaqById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.faqsService.getFaqById(id);
  }

  @Post()
  @UsePipes(ZodValidationPipe.for(createFaqSchema))
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.faqsService.createFaq(dto);
  }

  @Patch(':id')
  async updateFaq(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ZodValidationPipe.for(updateFaqSchema)) dto: UpdateFaqDto,
  ) {
    return this.faqsService.updateFaq(id, dto);
  }

  @Delete(':id')
  async deleteFaq(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.faqsService.deleteFaq(id);
  }
}