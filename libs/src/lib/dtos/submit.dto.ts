import { IsNotEmpty, IsString, IsUrl, Length, Matches } from 'class-validator';

export class SubmitProjectDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
    projectTitle: string;

  @IsNotEmpty()
  @IsString()
  @Length(20, 2000)
    projectDescription: string;

  @IsNotEmpty()
  @IsUrl()
  @Matches(/https:\/\/github.com\/.*/, {
    message: 'GitHub repository URL must be a valid GitHub link',
  })
    githubRepoUrl: string;
}
