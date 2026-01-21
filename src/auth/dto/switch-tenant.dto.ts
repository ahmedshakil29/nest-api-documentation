import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchTenantDto {
  @ApiProperty({ example: 'userId' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: 'tenantId' })
  @IsMongoId()
  tenantId: string;
}
