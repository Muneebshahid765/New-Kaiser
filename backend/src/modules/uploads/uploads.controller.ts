import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { ImageFolder } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole, Roles } from '../../common/decorators/roles.decorator';

@Controller('uploads')
@UseGuards(RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Roles(AppRole.ADMIN)
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: ImageFolder,
  ) {
    return this.uploadsService.uploadSingleFile(file, folder || ImageFolder.products);
  }

  @Roles(AppRole.ADMIN)
  @Get(':id/info')
  async getAssetInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.getAssetMetadata(id);
  }
}