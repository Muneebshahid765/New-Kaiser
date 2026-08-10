/*eslint-disable*/
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';// Adjust path according to project structure
import { CacheService } from 'src/core/cache/redis/cache.service';  // Adjust path according to project structure
import { CreateFaqDto, UpdateFaqDto } from '../dto/faq.dto';

@Injectable()
export class FaqsService {
  private readonly CACHE_KEY_PUBLIC = 'faqs:public:active';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  // Public: Get all active FAQs sorted by sortOrder
  async getActiveFaqs() {
    const cached = await this.cacheService.get(this.CACHE_KEY_PUBLIC);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    const faqs = await this.prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
      },
    });

    const response = { success: true, data: faqs };
    await this.cacheService.setex(this.CACHE_KEY_PUBLIC, 300, JSON.stringify(response)); // 5 min cache
    return response;
  }

  // Admin: Get all FAQs (including inactive)
  async getAllFaqs() {
    const faqs = await this.prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: faqs };
  }

  // Admin: Get single FAQ by ID
  async getFaqById(id: string) {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return { success: true, data: faq };
  }

  // Admin: Create new FAQ
  async createFaq(dto: CreateFaqDto) {
    const faq = await this.prisma.faq.create({
      data: dto,
    });

    await this.cacheService.del(this.CACHE_KEY_PUBLIC);
    return { success: true, message: 'FAQ created successfully', data: faq };
  }

  // Admin: Update FAQ
  async updateFaq(id: string, dto: UpdateFaqDto) {
    await this.getFaqById(id); // Throws NotFoundException if not present

    const updatedFaq = await this.prisma.faq.update({
      where: { id },
      data: dto,
    });

    await this.cacheService.del(this.CACHE_KEY_PUBLIC);
    return { success: true, message: 'FAQ updated successfully', data: updatedFaq };
  }

  // Admin: Delete FAQ
  async deleteFaq(id: string) {
    await this.getFaqById(id);

    await this.prisma.faq.delete({
      where: { id },
    });

    await this.cacheService.del(this.CACHE_KEY_PUBLIC);
    return { success: true, message: 'FAQ deleted successfully', id };
  }
}