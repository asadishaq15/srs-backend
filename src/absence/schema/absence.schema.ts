import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Student } from '../../student/schema/student.schema';

export type AbsenceDocument = Absence & Document;

@Schema({ timestamps: true })
export class Absence {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: Student;

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ['full', 'partial', 'late'], required: true })
  type: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop()
  documentName?: string;

  @Prop()
  documentUrl?: string;

  @Prop({ default: Date.now })
  submittedAt: Date;
}

export const AbsenceSchema = SchemaFactory.createForClass(Absence);