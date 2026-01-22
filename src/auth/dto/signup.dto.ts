// src/auth/dto/signup.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'Shakil Ahmed',
    description: 'Full name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'shakil@deepchain.com',
    description: 'Unique email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    minLength: 6,
    description: 'User password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'DeepChain',
    description:
      'Tenant name (only required if user is creating an organization)',
  })
  @IsOptional()
  @IsString()
  tenantName?: string;

  @ApiPropertyOptional({
    example: 'deepchain.com',
    description:
      'Unique tenant domain (only required if user is creating an organization)',
  })
  @IsOptional()
  @IsString()
  tenantDomain?: string;
}

// // src/auth/dto/signup.dto.ts
// import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

// export class SignupDto {
//   @IsNotEmpty()
//   name: string;

//   @IsEmail()
//   email: string;

//   @IsNotEmpty()
//   password: string;

//   // Optional tenant fields
//   @IsOptional()
//   tenantName?: string;

//   @IsOptional()
//   tenantDomain?: string;
// }
