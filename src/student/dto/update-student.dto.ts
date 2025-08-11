// srs-nest-main/src/student/dto/update-student.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateStudentDto {
  @IsNotEmpty()
  @IsString()
  studentID: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  class: string;

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

  @IsNotEmpty()
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
  transcripts?: string[]; // Can store file URL or text

  @IsOptional()
  @IsString()
  iipFlag?: string; // IIP-related info

  @IsBoolean()
  honorRolls: boolean; // Honor Rolls flag (default false)

  @IsOptional()
  @IsString()
  athletics?: string; // Athletics activities

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