// src/tenants/dto/create-tenant.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Deep Chain' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'deepchain.com' })
  @IsString()
  @IsNotEmpty()
  domain: string;
}
