import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDTO {
  @IsString()
    oldPassword: string;

  @IsString()
  @IsNotEmpty()
    newPassword: string;
}
