import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle: string;

  @Prop({ required: true, enum:['Admin','Student','Teacher'] })
  performBy: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
