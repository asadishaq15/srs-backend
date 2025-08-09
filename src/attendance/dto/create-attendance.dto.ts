import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

// attendance-entry.dto.ts

export class AttendanceEntryDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsNotEmpty()
  @IsEnum(['Present', 'Absent', 'Late', 'Excused'])
  attendance: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsMongoId()
  teacherId: string;

  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  date: string; // Format: YYYY-MM-DD

  @IsNotEmpty()
  @IsString()
  class: string;

  @IsNotEmpty()
  @IsString()
  section: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  @ArrayMinSize(1)
  students: AttendanceEntryDto[];
}
