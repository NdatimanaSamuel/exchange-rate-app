import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  names: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' }) // Ensures role is a valid enum
  role?: Role;
}
