/*eslint-disable*/
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ParseBoolPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  QueryCategorySchema,
  BulkDeleteCategorySchema,
  BulkStatusCategorySchema,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type QueryCategoryDto,
  type BulkDeleteCategoryDto,
  type BulkStatusCategoryDto,
} from './category.dto';

import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole, Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';

@Controller('categories')
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ==========================================
  // PUBLIC ROUTES (Must be above :id routes)
  // ==========================================

  @Public()
  @Get()
  @UsePipes(ZodValidationPipe.for(QueryCategorySchema))
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Public() // ✅ Guest users access kar sakein drop-down filter ke liye
  @Get('dropdown')
  async getDropdown() {
    return this.categoriesService.getDropdownList();
  }

@Public()
@Get('featured-categories')
async getFeaturedCategories() {
    return this.categoriesService.getFeaturedCategories()
  }

  @Public()
  @Get(':id')
  async getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  // ==========================================
  // ADMIN ROUTES
  // ==========================================

  @Roles(AppRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @Body(ZodValidationPipe.for(CreateCategorySchema)) dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create(dto, file);
  }

  @Roles(AppRole.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ZodValidationPipe.for(UpdateCategorySchema)) dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, dto, file);
  }

  @Roles(AppRole.ADMIN)
  @Delete(':id')
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean, // ✅ Type-safe boolean conversion
  ) {
    return this.categoriesService.delete(id, !!force);
  }

  @Roles(AppRole.ADMIN)
  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDeleteCategories(
    @Body(ZodValidationPipe.for(BulkDeleteCategorySchema)) dto: BulkDeleteCategoryDto,
  ) {
    return this.categoriesService.bulkDelete(dto);
  }

  @Roles(AppRole.ADMIN)
  @Put('bulk-status')
  async bulkUpdateCategoryStatus(
    @Body(ZodValidationPipe.for(BulkStatusCategorySchema)) dto: BulkStatusCategoryDto,
  ) {
    return this.categoriesService.bulkUpdateStatus(dto);
  }
}