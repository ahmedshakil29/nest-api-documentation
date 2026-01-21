// src/user-tenant/dto/update-user-tenant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserTenantDto } from './create-user-tenant.dto';

export class UpdateUserTenantDto extends PartialType(CreateUserTenantDto) {}
