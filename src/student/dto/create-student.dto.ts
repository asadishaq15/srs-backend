// srs-nest-main/src/student/dto/create-student.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
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

  @IsOptional()
  @IsArray()
  parents?: string[]; // Array of parent _id(s)

  @IsNotEmpty()
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