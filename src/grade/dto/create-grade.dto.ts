import { IsMongoId, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AssessmentComponentDto {
  @IsNumber()
  score: number;

  @IsNumber()
  weightage: number;
}

export class CreateGradeDto {
  @IsMongoId()
  teacherId: string;

  @IsMongoId()
  courseId: string;

  @IsMongoId()
  studentId: string;

  @IsString()
  class: string;

  @IsString()
  section: string;

  @IsString()
  term: string;

  @ValidateNested()
  @Type(() => AssessmentComponentDto)
  quiz: AssessmentComponentDto;

  @ValidateNested()
  @Type(() => AssessmentComponentDto)
  midTerm: AssessmentComponentDto;

  @ValidateNested()
  @Type(() => AssessmentComponentDto)
  project: AssessmentComponentDto;

  @ValidateNested()
  @Type(() => AssessmentComponentDto)
  finalTerm: AssessmentComponentDto;

  @IsNumber()
  overAll: number;
}

export class CreateGradeListDto {
  @ValidateNested({ each: true })
  @Type(() => CreateGradeDto)
  grades: CreateGradeDto[];
}
