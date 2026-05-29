import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDTO } from './base-query.dto';
import { HackathonStatus } from '../../responses/hackathon.response';

export class HackathonQueryDTO extends BaseQueryDTO {
  @IsEnum(HackathonStatus)
  @IsOptional()
  status?: HackathonStatus;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateTo?: Date;
}
