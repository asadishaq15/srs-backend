import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Department } from 'src/department/schema/department.schema';

export type CourseDocument = Course & Document & { _id: any };

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true })
  courseCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    required: true,
  })
  departmentId: Department;

  @Prop({ required: false })
  Prerequisites: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  courseCredit: number;
 
  @Prop({ required: true, default: false })
  active: boolean; 
    @Prop({ required: false, default: false })
  assigned: boolean;

  @Prop({ required: true, default: false })
  special: boolean;

  @Prop({
    required: true,
    enum: ['Full Year', 'Semester', 'Quarter'],
    default: 'Semester',
  })
  duration: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
