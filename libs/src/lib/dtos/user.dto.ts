import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsUrl,
  IsArray,
} from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
    email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
    password: string;
}

export class RegisterDTO {
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
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
    username: string;

  @IsOptional()
  @IsString()
    lastName?: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
    firstName?: string;

  @IsOptional()
  @IsString()
    lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
    username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
    bio?: string;

  @IsOptional()
  @IsUrl()
    avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    skills?: string[];
}
