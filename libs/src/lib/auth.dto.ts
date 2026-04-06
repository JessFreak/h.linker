import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class LoginDTO {
  @IsEmail({})
  @IsNotEmpty()
  @IsString()
    email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
    password: string;
}

export class RegisterDTO extends LoginDTO {
  @IsNotEmpty()
  @IsString()
    firstName: string;

  @IsNotEmpty()
  @IsString()
    username: string;

  @IsOptional()
  @IsString()
    lastName?: string;
}
