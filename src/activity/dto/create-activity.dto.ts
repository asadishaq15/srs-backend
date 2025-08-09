import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  subtitle?: string;

  @IsNotEmpty()
  @IsString()
  performBy: string;
}
