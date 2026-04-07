import { PickType, OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsUrl,
} from 'class-validator';

class UserBase {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
    email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
    password: string;

  @IsNotEmpty()
  @IsString()
    firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-z0-9_]+$/, { message: 'Username rules...' })
    username: string;

  @IsOptional()
  @IsString()
    lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
    bio?: string;

  @IsOptional()
  @IsUrl()
    avatarUrl?: string;
}

export class LoginDTO extends PickType(UserBase, [
  'email',
  'password',
] as const) {}

export class RegisterDTO extends OmitType(UserBase, [
  'bio',
  'avatarUrl',
] as const) {}

export class UpdateUserDTO extends PartialType(
  OmitType(UserBase, ['email', 'password'] as const),
) {}
