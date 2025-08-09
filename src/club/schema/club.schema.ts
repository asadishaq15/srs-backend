import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClubDocument = Club & Document;

@Schema({ timestamps: true })
export class Club {
  @Prop({ required: true, unique: true })
  clubName: string;

  @Prop()
  prerequisites: string;
}

export const ClubSchema = SchemaFactory.createForClass(Club);
