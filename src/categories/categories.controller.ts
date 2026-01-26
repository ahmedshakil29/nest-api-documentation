import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // @RequirePermission('category.create')
  // create(@Req() req, @Body() dto: CreateCategoryDto) {
  //   return this.categoriesService.create(req.tenant.tenantId, dto);
  //  }
  @Post()
  @RequirePermission(['category.create', 'category.manage'], 'OR')
  create(@Req() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.tenant.tenantId, dto);
  }

  @Get()
  @RequirePermission('category.read')
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.tenant.tenantId);
  }

  @Get(':id')
  @RequirePermission('category.read')
  findOne(@Req() req, @Param('id') id: string) {
    return this.categoriesService.findOne(req.tenant.tenantId, id);
  }

  @Patch(':id')
  @RequirePermission('category.update')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.tenant.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('category.delete')
  remove(@Req() req, @Param('id') id: string) {
    return this.categoriesService.remove(req.tenant.tenantId, id);
  }
}
