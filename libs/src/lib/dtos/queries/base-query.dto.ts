import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export class BaseQueryDTO {
  @IsEnum(Order)
  @IsOptional()
    order?: Order = Order.DESC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
    page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
    take?: number = 10;

  @IsString()
  @IsOptional()
    search?: string;

  get skip(): number {
    const currentPage = this.page ?? 1;
    const currentTake = this.take ?? 10;
    return (currentPage - 1) * currentTake;
  }
}
