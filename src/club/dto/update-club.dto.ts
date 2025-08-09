import { IsOptional, IsString } from 'class-validator';

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  clubName?: string;

  @IsOptional()
  @IsString()
  prerequisites?: string;
}
