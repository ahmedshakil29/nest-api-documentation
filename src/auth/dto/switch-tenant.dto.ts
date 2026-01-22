import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchTenantDto {
  @ApiProperty({ example: '696f243385fe0261215ff221' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '69706169a89bd2f4938514c9' })
  @IsMongoId()
  tenantId: string;
}
