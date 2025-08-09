import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClubDto {
  @IsNotEmpty()
  @IsString()
  clubName: string;

  @IsString()
  prerequisites?: string;
}
