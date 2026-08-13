/*eslint-disable*/
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole, Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';

import {
  type CreateProductDto,
  CreateProductSchema,
  type UpdateProductDto,
  UpdateProductSchema,
} from './dto/create-product.dto';
import {
  type BulkUpdateProductDto,
  BulkUpdateProductSchema,
} from './dto/bulk-update-product.dto';


@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =========================================================================
  // 2. PROTECTED / ADMIN STATIC ROUTES
  // =========================================================================

  @Get('inventory')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.productsService.getInventoryData({
      page: Number.isNaN(parsedPage) ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) ? 10 : parsedLimit,
      search,
      status,
    });
  }

  @Post('create')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async createProduct(
    @Body(ZodValidationPipe.for(CreateProductSchema)) dto: CreateProductDto,
  ) {
    const product = await this.productsService.createProduct(dto);
    return {
      success: true,
      message: 'Product created successfully',
      product,
    };
  }

  @Patch('bulk-update')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkUpdateProducts(
    @Body(ZodValidationPipe.for(BulkUpdateProductSchema))
    dto: BulkUpdateProductDto,
  ) {
    return this.productsService.bulkUpdate(dto);
  }



  // =========================================================================
  // 4. PROTECTED / ADMIN PARAMETERIZED ROUTES
  // =========================================================================

  @Post(':id/duplicate')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async duplicateProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.duplicateProduct(id);
  }

  @Put('admin/:id')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateAdmin(
    @Param('id') id: string,
    @Body(ZodValidationPipe.for(UpdateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete('admin/:id/soft')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDeleteProduct(id);
  }

  @Patch('admin/:id/restore')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restoreProduct(id);
  }

  @Delete('admin/:id/hard')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.hardDeleteProduct(id);
  }

  // Note: Wildcard/Generic param routes should stay near the bottom to avoid blocking other endpoints
  @Get(':param')
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('param') param: string) {
    return this.productsService.adminfindOneById(param);
  }
}