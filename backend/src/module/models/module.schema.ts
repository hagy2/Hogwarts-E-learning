import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Course } from '../../course/models/course.schema';
import { questions } from '../../questions/models/questions.schema'
import { Quiz } from 'src/quizzes/models/quizzes.schema';
export type ModuleDocument = HydratedDocument<Module>;

import * as mongoose from 'mongoose';
@Schema({ timestamps: true })
export class Module {

  @Prop({ type: mongoose.Types.ObjectId, ref: Course.name, required: true })
  courseId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Quiz', required: false })
  quiz_id: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  content: string;

   @Prop([{ 
    filename: { type: String, required: true }, 
    path: { type: String, required: true }, 
    mimetype: { type: String, required: true } 
  }])  
  mediaFiles: { filename: string; path: string; mimetype: string }[];
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  })
  difficulty: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'questions',default :"000000000000000000000000" })
  questionBank_id: mongoose.Types.ObjectId;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  TFcount: number;

  @Prop({ default: 0 })
  MCQcount: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' })
  creator: mongoose.Types.ObjectId;

  @Prop({default:[]})
  keywords:string[];

  @Prop({ default: 0 })
  tookQuiz: number;
  @Prop ({default:false})
  isLast:boolean;
}
export const ModuleSchema = SchemaFactory.createForClass(Module);
