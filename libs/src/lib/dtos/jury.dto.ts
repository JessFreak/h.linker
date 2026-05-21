import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SetScoresDto {
  @IsObject()
  @IsNotEmpty()
    scores: Record<string, number>;
}

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(800)
    summary: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
    strengths?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
    weaknesses?: string;
}