// src/permissions/dto/update-permission.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({ example: 'Create users' })
  @IsOptional()
  @IsString()
  description?: string;
}
