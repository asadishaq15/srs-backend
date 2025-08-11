// srs-nest-main/src/student/schema/student.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Parent } from '../../parent/schema/parent.schema';

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true, unique: true })
  studentId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  class: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  emergencyContact: string;

  @Prop({ required: true })
  enrollDate: string;

  @Prop({ required: true })
  expectedGraduation: string;

  @Prop({
    default: '$2b$10$1VlR8HWa.Pzyo96BdwL0H.3Hdp2WF9oRX1W9lEF4EohpCWbq70jKm',
  })
  password: string; // Hashed password

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Parent' }], required: false, default: [] })
  parents: (Parent | Types.ObjectId)[];

  @Prop({ required: true, default: 'N/A' })
  profilePhoto: string; // Store URL of the photo

  @Prop({ required: false })
  transcripts: string[]; // Store transcript as a file URL or text

  @Prop({ required: false, default: false })
  iipFlag: boolean; // IIP Flag information

  @Prop({ default: false })
  honorRolls: boolean; // Honor Rolls flag

  @Prop({ default: false })
  athletics: boolean; // Athletics activities

  @Prop({ required: false })
  clubs: string; // Clubs participation

  @Prop({ type: [String], required: false, default: [] })
  reportCards: string[]; 

  @Prop({ required: false })
  lunch: string; // Lunch preference

  @Prop({ required: false })
  nationality: string; // Nationality of student
}

export const StudentSchema = SchemaFactory.createForClass(Student);