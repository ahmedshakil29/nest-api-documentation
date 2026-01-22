// src/auth/dto/refresh.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: '696f243385fe0261215ff221' })
  @IsString()
  userId: string;

  // @ApiProperty({ example: '69706169a89bd2f4938514c9' })
  // @IsString()
  // tenantId: string;

  @ApiProperty({ example: 'eyJhbGc.......iOiJIUz' })
  @IsString()
  refreshToken: string;
}
