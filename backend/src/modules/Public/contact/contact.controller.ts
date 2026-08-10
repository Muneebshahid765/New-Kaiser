import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MessagesService } from './contact.service';
import {
  createMessageSchema,
  getMessagesQuerySchema,
  updateStatusSchema,
  replyMessageSchema,
  bulkDeleteMessagesSchema,
 type CreateMessageDto,
 type GetMessagesQueryDto,
 type UpdateStatusDto,
 type ReplyMessageDto,
 type BulkDeleteMessagesDto,
} from '../dto/contact.dto';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppRole, Roles } from 'src/common/decorators/roles.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // PUBLIC: Submit Contact Form
  @Post()
  @UsePipes(ZodValidationPipe.for(createMessageSchema))
  async createMessage(@Body() dto: CreateMessageDto) {
    return this.messagesService.createMessage(dto);
  }

  // ADMIN ENDPOINTS
  @Get()
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async getMessages(
    @Query(ZodValidationPipe.for(getMessagesQuerySchema)) query: GetMessagesQueryDto,
  ) {
    return this.messagesService.getMessages(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async getMessageById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.messagesService.getMessageById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ZodValidationPipe.for(updateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return this.messagesService.updateMessageStatus(id, dto);
  }

  @Post(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async replyToMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ZodValidationPipe.for(replyMessageSchema)) dto: ReplyMessageDto,
  ) {
    return this.messagesService.replyToMessage(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async deleteMessage(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.messagesService.deleteMessage(id);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async bulkDelete(
    @Body(ZodValidationPipe.for(bulkDeleteMessagesSchema)) dto: BulkDeleteMessagesDto,
  ) {
    return this.messagesService.bulkDeleteMessages(dto);
  }
}