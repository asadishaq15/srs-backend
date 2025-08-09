import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema()
export class Teacher {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    default: '$2b$10$1VlR8HWa.Pzyo96BdwL0H.3Hdp2WF9oRX1W9lEF4EohpCWbq70jKm',
  })
  password: string; 

   @Prop({ type: [String], default: [] })
  assignedCourses: string[]; 
  
  @Prop()
  department: string;

  @Prop()
  address: string;

  @Prop()
  qualification: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
