// src/roles/dto/create-role.dto.ts
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '696..........221' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissionIds?: string[];
}
