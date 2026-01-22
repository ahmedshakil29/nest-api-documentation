import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserTenantService } from './user-tenant.service';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-tenants')
export class UserTenantController {
  constructor(private readonly service: UserTenantService) {}

  // ✅ Assign a user to a tenant
  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @RequirePermission('assign_user_to_tenant')
  assignUser(@Req() req, @Body() dto: CreateUserTenantDto) {
    return this.service.assignUser(dto, req.headers['x-tenant-id']);
  }

  // ✅ Get all active tenants for the logged-in user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyTenants(@Req() req) {
    return this.service.getUserTenants(req.user.sub);
  }

  // ✅ Update a membership
  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @RequirePermission('UPDATE_USER_TENANT')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserTenantDto,
  ) {
    return this.service.update(id, dto);
  }

  // ✅ Remove a membership
  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @RequirePermission('REMOVE_USER_TENANT')
  remove(@Req() req, @Param('id') id: string) {
    return this.service.remove(id);
  }

  // ✅ Get specific membership by user + tenant
  @Get('membership/:userId/:tenantId')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @RequirePermission('VIEW_USER_TENANT')
  getMembership(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.service.getMembership(userId, tenantId);
  }
}

// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { UserTenantService } from './user-tenant.service';
// import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
// import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
// import { TenantGuard } from '../auth/guards/tenant.guard';
// import { PermissionGuard } from '../auth/guards/permission.guard';
// import { RequirePermission } from '../auth/decorators/require-permission.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @Controller('user-tenants')
// export class UserTenantController {
//   constructor(private readonly service: UserTenantService) {}

//   // ✅ Assign a user to a tenant
//   @Post()
//   @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
//   @RequirePermission('ASSIGN_USER_TO_TENANT')
//   assignUser(@Req() req, @Body() dto: CreateUserTenantDto) {
//     return this.service.assignUser(dto, req.headers['x-tenant-id']);
//   }

//   // ✅ Get all active tenants for the logged-in user
//   @Get('me')
//   @UseGuards(JwtAuthGuard, TenantGuard)
//   getMyTenants(@Req() req) {
//     return this.service.getUserTenants(req.user.sub);
//   }

//   // ✅ Update a membership
//   @Patch(':id')
//   @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
//   @RequirePermission('UPDATE_USER_TENANT')
//   update(
//     @Req() req,
//     @Param('id') id: string,
//     @Body() dto: UpdateUserTenantDto,
//   ) {
//     return this.service.update(id, dto);
//   }

//   // ✅ Remove a membership
//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
//   @RequirePermission('REMOVE_USER_TENANT')
//   remove(@Req() req, @Param('id') id: string) {
//     return this.service.remove(id);
//   }

//   // ✅ Get specific membership by user + tenant
//   @Get('membership/:userId/:tenantId')
//   @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
//   @RequirePermission('VIEW_USER_TENANT')
//   getMembership(
//     @Param('userId') userId: string,
//     @Param('tenantId') tenantId: string,
//   ) {
//     return this.service.getMembership(userId, tenantId);
//   }
// }

// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { UserTenantService } from './user-tenant.service';
// import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
// import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
// import { TenantGuard } from '../auth/guards/tenant.guard';
// import { PermissionGuard } from '../auth/guards/permission.guard';
// import { RequirePermission } from '../auth/decorators/require-permission.decorator';

// @Controller('user-tenants')
// export class UserTenantController {
//   constructor(private readonly service: UserTenantService) {}

//   // ✅ Assign a user to a tenant (only admins can assign)
//   // @Post()
//   // @UseGuards(TenantGuard, PermissionGuard)
//   // @RequirePermission('ASSIGN_USER_TO_TENANT')
//   // assignUser(@Req() req, @Body() dto: CreateUserTenantDto) {
//   //   return this.service.assignUser(dto);
//   // }
//   @Post()
//   @UseGuards(TenantGuard, PermissionGuard)
//   @RequirePermission('ASSIGN_USER_TO_TENANT')
//   assignUser(@Req() req, @Body() dto: CreateUserTenantDto) {
//     return this.service.assignUser(dto, req.headers['x-tenant-id']);
//   }

//   // ✅ Get all active tenants for the logged-in user
//   @Get('me')
//   @UseGuards(TenantGuard)
//   getMyTenants(@Req() req) {
//     const userId = req.user.sub;
//     return this.service.getUserTenants(userId);
//   }

//   // ✅ Update a membership (requires proper permission)
//   @Patch(':id')
//   @UseGuards(TenantGuard, PermissionGuard)
//   @RequirePermission('UPDATE_USER_TENANT')
//   update(
//     @Req() req,
//     @Param('id') id: string,
//     @Body() dto: UpdateUserTenantDto,
//   ) {
//     return this.service.update(id, dto);
//   }

//   // ✅ Remove a membership (requires proper permission)
//   @Delete(':id')
//   @UseGuards(TenantGuard, PermissionGuard)
//   @RequirePermission('REMOVE_USER_TENANT')
//   remove(@Req() req, @Param('id') id: string) {
//     return this.service.remove(id);
//   }

//   // ✅ Get specific membership by user + tenant
//   @Get('membership/:userId/:tenantId')
//   @UseGuards(TenantGuard, PermissionGuard)
//   @RequirePermission('VIEW_USER_TENANT')
//   getMembership(
//     @Param('userId') userId: string,
//     @Param('tenantId') tenantId: string,
//   ) {
//     return this.service.getMembership(userId, tenantId);
//   }
// }

// // src/user-tenant/user-tenant.controller.ts
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { UserTenantService } from './user-tenant.service';
// import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
// import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';

// @Controller('user-tenants')
// export class UserTenantController {
//   constructor(private readonly service: UserTenantService) {}

//   // ✅ Assign a user to a tenant
//   @Post()
//   assignUser(@Body() dto: CreateUserTenantDto) {
//     return this.service.assignUser(dto);
//   }

//   // ✅ Get all active tenants for a user
//   @Get('user/:userId')
//   getUserTenants(@Param('userId') userId: string) {
//     return this.service.getUserTenants(userId);
//   }

//   // ✅ Update a membership
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateUserTenantDto) {
//     return this.service.update(id, dto);
//   }

//   // ✅ Remove a membership (hard delete)
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.service.remove(id);
//   }

//   // ✅ Optional: get specific membership by user + tenant
//   @Get('membership/:userId/:tenantId')
//   getMembership(
//     @Param('userId') userId: string,
//     @Param('tenantId') tenantId: string,
//   ) {
//     return this.service.getMembership(userId, tenantId);
//   }
// }
