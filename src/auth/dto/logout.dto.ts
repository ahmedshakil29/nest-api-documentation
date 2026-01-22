// src/auth/dto/logout.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ example: '696f243385fe0261215ff221' })
  @IsString()
  userId: string;

  @IsString()
  tenantId: string;
}
