// src/user-tenant/dto/create-user-tenant.dto.ts
import { IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { TenantStatus } from '../../schemas/user-tenant.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTenantDto {
  @ApiProperty({ example: '696f243385fe0261215ff221' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '69706169a89bd2f4938514c9' })
  @IsMongoId()
  tenantId: string;

  @ApiProperty({ example: '69706169a89bd2f4938514c9' })
  @IsMongoId()
  roleId: string;

  @ApiProperty({
    enum: TenantStatus,
    example: TenantStatus.ACTIVE,
    required: false,
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
