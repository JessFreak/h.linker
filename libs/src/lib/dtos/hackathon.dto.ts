import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsUUID, IsEnum,
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import { HackathonStatus } from '../responses/hackathon.response';

export class CreateHackathonDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
    title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
    slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
    description?: string;

  @IsDateString()
    registrationStartDate: string;

  @IsDateString()
    startDate: string;

  @IsDateString()
    endDate: string;

  @IsDateString()
    submissionDeadline: string;

  @IsString()
  @IsOptional()
    imageUrl?: string;
}

export class UpdateHackathonDTO {
  @IsString()
  @IsOptional()
  @MinLength(5)
    title?: string;

  @IsString()
  @IsOptional()
    slug?: string;

  @IsString()
  @IsOptional()
    description?: string;

  @IsDateString()
  @IsOptional()
    registrationStartDate?: string;

  @IsDateString()
  @IsOptional()
    startDate?: string;

  @IsDateString()
  @IsOptional()
    endDate?: string;

  @IsDateString()
  @IsOptional()
    submissionDeadline?: string;

  @IsString()
  @IsOptional()
    imageUrl?: string;
}

export class CriterionDTO {
  @IsString()
  @IsNotEmpty()
    name: string;

  @IsNumber()
  @Min(1)
  @Max(100)
    weight: number;

  @IsNumber()
  @IsOptional()
    maxValue?: number = 10;
}

export class SetCriteriaDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => CriterionDTO)
    criteria: CriterionDTO[];
}

export class AddJuryDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
    userId: string;
}

export class UpdateHackathonStatusDTO {
  @IsEnum(HackathonStatus)
  @IsNotEmpty()
    status: HackathonStatus;
}

export class SetCategoriesDTO {
  @IsArray()
  @IsString({ each: true })
    categories: string[];
}