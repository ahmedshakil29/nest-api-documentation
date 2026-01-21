// src/user-tenant/dto/create-user-tenant.dto.ts
import { IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { TenantRole, TenantStatus } from '../../schemas/user-tenant.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTenantDto {
  @ApiProperty({ example: '64f...abc' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '64f...xyz' })
  @IsMongoId()
  tenantId: string;

  @ApiProperty({
    enum: TenantRole,
    example: TenantRole.MEMBER,
    required: false,
  })
  @IsEnum(TenantRole)
  @IsOptional()
  role?: TenantRole;

  @ApiProperty({
    enum: TenantStatus,
    example: TenantStatus.ACTIVE,
    required: false,
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
