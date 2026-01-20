import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Shakil Ahmed' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'shakil@deepchain.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

// import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsString, MinLength } from 'class-validator';

// export class CreateUserDto {
//   @ApiProperty({ example: 'Shakil Ahmed' })
//   @IsString()
//   name: string;

//   @ApiProperty({ example: 'shakil@deepchain.com' })
//   @IsEmail()
//   email: string;

//   @ApiProperty({ example: '12345678' })
//   @IsString()
//   @MinLength(6)
//   password: string;
// }
