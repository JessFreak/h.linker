import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTeamDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
    name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
    description?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.communicationLink && o.communicationLink !== '')
  @IsUrl()
    communicationLink?: string;
}

export class UpdateTeamDTO extends PartialType(CreateTeamDTO) {}
