import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDTO } from './base-query.dto';

export class UserQueryDTO extends BaseQueryDTO {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  connectedGithub?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRecommended?: boolean;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
