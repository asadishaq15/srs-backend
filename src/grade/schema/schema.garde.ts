import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Student } from '../../student/schema/student.schema';
import { Course, CourseDocument } from 'src/course/schema/course.schema';
import { Teacher } from 'src/teacher/schema/schema.teacher';

export type GradeDocument = Grade & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};


export class GradeComponent {
  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  weightage: number;
}

@Schema({ timestamps: true })
export class Grade {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Teacher', required: true })
  teacherId: Teacher;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: CourseDocument;
  

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  studentId: Student;

  @Prop({ required: true })
  class: string; // Example: 10, 11, 12

  @Prop({ required: true })
  section: string; // Example: A B C

  @Prop({ required: true })
  term: string; // Example: A B C

  @Prop({ type: GradeComponent, required: true })
  quiz: GradeComponent;

  @Prop({ type: GradeComponent, required: true })
  midTerm: GradeComponent;

  @Prop({ type: GradeComponent, required: true })
  project: GradeComponent;

  @Prop({ type: GradeComponent, required: true })
  finalTerm: GradeComponent;

  @Prop({ required: true })
  overAll: number;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
