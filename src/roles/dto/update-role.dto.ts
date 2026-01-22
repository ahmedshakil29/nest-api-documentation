// src/roles/dto/update-role.dto.ts
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissionIds?: string[];
}
