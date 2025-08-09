import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from 'src/course/schema/course.schema';
import { Teacher } from 'src/teacher/schema/schema.teacher';

export type ScheduleDocument = Schedule & Document;

class ScheduleDay {
  @Prop({ required: true })
  startTime: string; // e.g., "10:00 AM"

  @Prop({ required: true })
  endTime: string; // e.g., "12:00 PM"

  @Prop({ required: true })
  date: string; // e.g., "Monday"
}

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ required: true })
  className: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: false })
  note: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Teacher', required: true })
  teacherId: Teacher; // Reference to Teacher Schema

  @Prop({ type: [ScheduleDay], required: true })
  dayOfWeek: ScheduleDay[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
