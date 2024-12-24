import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {Module} from '../../module/models/module.schema';

export type progressDocument= HydratedDocument<Progress>
@Schema()
export class Progress {
 
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  course_id: string;

  @Prop({ min: 0, max: 100  ,default:1})
  completion_percentage: number;

  @Prop({ required: true })
  last_accessed: Date;

  @Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'] ,default:'Beginner'})
  performanceMetric: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }] })
   accessed_modules :  mongoose.Types.ObjectId[];

  @Prop({default:1})
   avgScore: number;
 
  
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);