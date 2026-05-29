import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDTO } from './base-query.dto';
import { HackathonStatus } from '../../responses/hackathon.response';

export class HackathonQueryDTO extends BaseQueryDTO {
  @IsEnum(HackathonStatus)
  @IsOptional()
  status?: HackathonStatus;
}
