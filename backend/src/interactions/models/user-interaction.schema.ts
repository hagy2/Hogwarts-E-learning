import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserInteraction extends Document {
  @Prop({ required: true })
  interaction_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ type: [String], required: true }) // Change to an array of course IDs
  course_ids: string[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  time_spent_minutes: number;

  @Prop({ required: true })
  last_accessed: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

