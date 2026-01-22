// src/user-tenant/user-tenant.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserTenantService } from './user-tenant.service';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';

@Controller('user-tenants')
export class UserTenantController {
  constructor(private readonly service: UserTenantService) {}

  // ✅ Assign a user to a tenant
  @Post()
  assignUser(@Body() dto: CreateUserTenantDto) {
    return this.service.assignUser(dto);
  }

  // ✅ Get all active tenants for a user
  @Get('user/:userId')
  getUserTenants(@Param('userId') userId: string) {
    return this.service.getUserTenants(userId);
  }

  // ✅ Update a membership
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserTenantDto) {
    return this.service.update(id, dto);
  }

  // ✅ Remove a membership (hard delete)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ✅ Optional: get specific membership by user + tenant
  @Get('membership/:userId/:tenantId')
  getMembership(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.service.getMembership(userId, tenantId);
  }
}

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

//   @Post()
//   assignUser(@Body() dto: CreateUserTenantDto) {
//     return this.service.assignUser(dto);
//   }

//   @Get('user/:userId')
//   getUserTenants(@Param('userId') userId: string) {
//     return this.service.getUserTenants(userId);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateUserTenantDto) {
//     return this.service.update(id, dto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.service.remove(id);
//   }
// }
