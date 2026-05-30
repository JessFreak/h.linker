import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDTO } from './base-query.dto';

export class ProjectQueryDTO extends BaseQueryDTO {
  @IsOptional()
  @IsUUID()
  hackathonId?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
