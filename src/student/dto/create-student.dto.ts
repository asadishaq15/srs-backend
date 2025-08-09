import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  class: string;

  @IsNotEmpty()
  @IsString()
  emergencyContact: string;

  @IsNotEmpty()
  @IsString()
  section: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsDate()
  dob: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsDate()
  enrollDate: string;

  @IsNotEmpty()
  @IsDate()
  expectedGraduation: string;

  @IsNotEmpty()
  @IsString()
  guardianName: string;

  @IsNotEmpty()
  @IsEmail()
  guardianEmail: string;

  @IsNotEmpty()
  @IsString()
  guardianPhone: string;

  // @IsNotEmpty()
  @IsString()
  guardianPhoto: string;

  @IsNotEmpty()
  @IsString()
  guardianRelation: string;

  @IsNotEmpty()
  @IsString()
  guardianProfession: string;

  // @IsNotEmpty()
  @IsString()
  profilePhoto: string;

  @IsOptional()
  @IsString()
  transcripts?: string[]; 

  @IsOptional()
  @IsString()
  iipFlag?: string; 

  @IsBoolean()
  honorRolls: boolean;

  @IsBoolean()
  athletics: boolean; 

  @IsOptional()
  @IsString()
  clubs?: string; // Clubs participation

  @IsOptional()
  @IsString()
  lunch?: string; // Lunch preference

  @IsNotEmpty()
  @IsString()
  nationality: string; // Nationality of student
}
