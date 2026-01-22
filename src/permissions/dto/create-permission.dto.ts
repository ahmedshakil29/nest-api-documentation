// src/permissions/dto/create-permission.dto.ts
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user.create' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+\.[a-z]+$/, {
    message: 'key must be like "user.create"',
  })
  key: string;

  @ApiProperty({ example: 'Create users' })
  @IsOptional()
  @IsString()
  description?: string;
}
