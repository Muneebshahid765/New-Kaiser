/*eslint-disable*/
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Put,
  Param,
  Get,
  Patch,
  Query,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ProductsService } from './products.service';


import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole, Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { type CreateProductDto, CreateProductSchema, type UpdateProductDto, UpdateProductSchema } from './dto/create-product.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { type BulkUpdateProductDto, BulkUpdateProductSchema } from './dto/bulk-update-product.dto';
import {type GetProductsFilter } from './dto/filter.dto';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()  
@Get()
  async getProducts(@Query() query: GetProductsFilter) {
    return this.productsService.getFilteredProducts(query);
  }





  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  async getInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.productsService.getInventoryData({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      status,
    });
  }

  @Public()
  @Get('featured-products')
  @HttpCode(HttpStatus.OK)
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

    @Post('create')
    @HttpCode(HttpStatus.OK)
  @Roles(AppRole.ADMIN)
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


@Public()
@Get(':param')
@HttpCode(HttpStatus.OK)
  async getOne(@Param('param') param: string) {
    return this.productsService.findOneByIdOrSlug(param);
  }

  // -------------------------------------------------------------
  // PUT /api/v1/products/admin/:id (Admin Product Update)
  // -------------------------------------------------------------
  @Put('admin/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  async updateAdmin(
    @Param('id') id: string,
    @Body(ZodValidationPipe.for(UpdateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }



  /**
   * 2. PATCH Bulk Update Products (Industry Standard Bulk Endpoint)
   * Target UI: PATCH /admin/products/bulk-update
   */
  @Patch('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateProducts(
    @Body(ZodValidationPipe.for(BulkUpdateProductSchema)) dto: BulkUpdateProductDto,
  ) {
    return this.productsService.bulkUpdate(dto);
  }

  /**
   * 3. POST Duplicate Single Product
   * Target UI: POST /admin/products/:id/duplicate
   */
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.OK)
  async duplicateProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.duplicateProduct(id);
  }
 //soft Delete//
  @Delete('admin/:id/soft')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDeleteProduct(id);
  }
  /**
   * 4. PATCH Restore Soft-Deleted Product
   * Target UI: PATCH /admin/products/:id/restore
   */
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  async restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restoreProduct(id);
  }

    @Delete('admin/:id/hard')
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.hardDeleteProduct(id);
  }

}