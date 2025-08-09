import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  courseCode: string;

  @IsNotEmpty()
  @IsString()
  courseName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  Prerequisites: number;

  @IsNotEmpty()
  @IsString()
  courseCredit: number;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsNotEmpty()
  @IsBoolean()
  special: boolean;

  @IsNotEmpty()
  @IsString()
  duration: string;
}
