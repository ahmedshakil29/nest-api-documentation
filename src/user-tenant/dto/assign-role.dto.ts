// src/user-tenant/dto/assign-role.dto.ts
import { IsMongoId } from 'class-validator';

export class AssignRoleDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  roleId: string;
}
