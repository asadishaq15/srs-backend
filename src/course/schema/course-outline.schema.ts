import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Teacher } from 'src/teacher/schema/schema.teacher';
import { courseOutlineStatus } from 'utils/enum';

export type CourseOutlineDocument = CourseOutline & Document;

@Schema({ timestamps: true })
export class CourseOutline {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  })
  teacherId: Teacher;

  @Prop({
    type: String,
    enum: courseOutlineStatus,
    default: courseOutlineStatus.Pending,
  })
  status: string;

  @Prop({ required: true })
  document: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: false })
  notes: string;
}

export const CourseOutlineSchema = SchemaFactory.createForClass(CourseOutline);
