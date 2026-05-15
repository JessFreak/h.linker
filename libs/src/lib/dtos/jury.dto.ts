import { IsNotEmpty, IsObject, IsString, MaxLength } from 'class-validator';

export class SetScoresDto {
  @IsObject()
  @IsNotEmpty()
    scores: Record<string, number>;
}

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(800)
    text: string;
}