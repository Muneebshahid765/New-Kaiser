/*eslint-disable*/
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { PublicProductsService } from './public-products.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { type GetProductsFilter } from '../dto/filter.dto';
import { type GetProductReviewsDto, getProductReviewsSchema } from 'src/modules/buyer/dto/buyer-review.dto';


@Controller('public-products')
export class PublicProductsController {
  constructor(private readonly productsService: PublicProductsService) {}

  // 1. GET ALL FILTERED PRODUCTS -> GET /api/v1/public-products
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(@Query() query: GetProductsFilter) {
    return this.productsService.getFilteredProducts(query);
  }

  // 2. FEATURED PRODUCTS -> GET /api/v1/public-products/featured-products
  @Public()
  @Get('featured-products')
  @HttpCode(HttpStatus.OK)
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  // 3. SIMILAR PRODUCTS -> GET /api/v1/public-products/:id/similar?categoryId=xxx
  @Public()
  @Get(':id/similar')
  @HttpCode(HttpStatus.OK)
  async getSimilarProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('categoryId') categoryId: string,
  ) {
    if (!categoryId) {
      throw new BadRequestException('categoryId is required');
    }
    return this.productsService.getSimilarProducts(id, categoryId);
  }


  // 5. SINGLE PRODUCT DETAILS (Must be at bottom) -> GET /api/v1/public-products/detail/:param
  @Public()
  @Get('detail/:param')
  @HttpCode(HttpStatus.OK)
  async getProductDetails(
    @Param('param') param: string,
    @Query(ZodValidationPipe.for(getProductReviewsSchema))
    reviewDto: GetProductReviewsDto,
  ) {
    return this.productsService.getPublicProductDetails(param, reviewDto);
  }
}