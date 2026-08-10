/*eslint-disable*/
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CacheService } from 'src/core/cache/redis/cache.service';
import { MessageStatus, Prisma } from '@prisma/client';
import {
  CreateMessageDto,
  GetMessagesQueryDto,
  UpdateStatusDto,
  ReplyMessageDto,
  BulkDeleteMessagesDto,
} from '../dto/contact.dto';
// import {
//   sendNewMessageNotificationToAdmin,
//   sendReplyNotificationToCustomer,
// } from '@/services/messageEmailService';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  // Rate Limiting Logic (Max 3 submissions per hour per email)
  private async checkRateLimit(email: string): Promise<boolean> {
    const key = `rate_limit:contact:${email}`;
    const current = await this.cacheService.get(key);
    const count = current ? parseInt(current as string, 10) : 0;

    if (count >= 3) {
      return false;
    }

    if (count === 0) {
      await this.cacheService.setex(key, 3600, '1'); // TTL 1 hour
    } else {
      await this.cacheService.incr(key);
    }
    return true;
  }

  // POST /messages - Create Contact Message
  async createMessage(dto: CreateMessageDto) {
    const isAllowed = await this.checkRateLimit(dto.email);
    if (!isAllowed) {
      throw new HttpException(
        'Too many submissions. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const newMessage = await this.prisma.message.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        status: MessageStatus.unread,
      },
    });

    // Send async email to admin
    // sendNewMessageNotificationToAdmin({
    //   name: newMessage.name,
    //   email: newMessage.email,
    //   phone: newMessage.phone,
    //   message: newMessage.message,
    //   createdAt: newMessage.createdAt,
    // }).catch((err) =>
    //   this.logger.error('Failed to send admin notification email:', err),
    // );

    return {
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      },
    };
  }

  // GET /messages - Fetch All Messages (Admin)
  async getMessages(query: GetMessagesQueryDto) {
    const { page, limit, status, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MessageWhereInput = {};

    if (status) {
      where.status = status as MessageStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [messages, totalMessages, unreadCount, readCount] =
      await this.prisma.$transaction([
        this.prisma.message.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        this.prisma.message.count({ where }),
        this.prisma.message.count({ where: { ...where, status: MessageStatus.unread } }),
        this.prisma.message.count({ where: { ...where, status: MessageStatus.read } }),
      ]);

    const totalPages = Math.ceil(totalMessages / limit);

    return {
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        messagesPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      statistics: {
        totalMessages: unreadCount + readCount,
        unreadMessages: unreadCount,
        readMessages: readCount,
      },
    };
  }

  // GET /messages/:id - Fetch Single Message
  async getMessageById(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.status === MessageStatus.unread) {
      const updated = await this.prisma.message.update({
        where: { id },
        data: { status: MessageStatus.read },
      });
      return { success: true, message: updated };
    }

    return { success: true, message };
  }

  // PATCH /messages/:id/status - Update Status
  async updateMessageStatus(id: string, dto: UpdateStatusDto) {
    await this.getMessageById(id);

    const updated = await this.prisma.message.update({
      where: { id },
      data: { status: dto.status as MessageStatus },
    });

    return {
      success: true,
      message: 'Message status updated successfully',
      data: updated,
    };
  }

  // POST /messages/:id/reply - Admin Reply
  async replyToMessage(id: string, dto: ReplyMessageDto) {
    const existing = await this.prisma.message.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Message not found');
    }

    const updated = await this.prisma.message.update({
      where: { id },
      data: {
        adminReply: dto.reply,
        repliedAt: new Date(),
        status: MessageStatus.read,
      },
    });

    // sendReplyNotificationToCustomer(
    //   {
    //     name: updated.name,
    //     email: updated.email,
    //     message: updated.message,
    //     createdAt: updated.createdAt,
    //   },
    //   dto.reply,
    // ).catch((err) =>
    //   this.logger.error('Failed to send customer reply email:', err),
    // );

    return {
      success: true,
      message: 'Reply sent successfully',
      data: updated,
    };
  }

  // DELETE /messages/:id - Delete Single
  async deleteMessage(id: string) {
    await this.getMessageById(id);

    await this.prisma.message.delete({ where: { id } });

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }

  // DELETE /messages - Bulk Delete
  async bulkDeleteMessages(dto: BulkDeleteMessagesDto) {
    const result = await this.prisma.message.deleteMany({
      where: { id: { in: dto.ids } },
    });

    return {
      success: true,
      message: `${result.count} message(s) deleted successfully`,
      deletedCount: result.count,
    };
  }
}