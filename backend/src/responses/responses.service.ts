import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Response,responseDocument } from './models/responses.schema';
import { CreateResponseDto } from './dto/creatresponse.dto';
import { UpdateResponseDto } from './dto/updateresponse.dto';
import { Quiz,quizDocument } from '../quizzes/models/quizzes.schema';
import {Module,ModuleDocument} from '../module/models/module.schema';//dep
import { Progress,progressDocument } from 'src/progress/models/progress.schema';//dep
import { Course,CourseDocument } from "../course/models/course.schema";//dep
@Injectable()
export class ResponsesService {
  
  constructor(@InjectModel(Response.name) private responseModel: Model<Response>,
            @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
            @InjectModel(Module.name) private readonly moduleModel: Model<Module>,
            @InjectModel(Progress.name) private readonly progressModel: Model<Progress>,
            @InjectModel(Course.name) private readonly courseModel: Model<Course>,) {}


  async create(ResponseData: Response ): Promise<responseDocument> {
    const createdResponse = new this.responseModel(ResponseData);
  let quizId=createdResponse.quiz_id;
   let score=0;
   const quiz=await this.quizModel.findById(quizId).exec();
   let quizQs=quiz.quizQuestions;
   let answers=createdResponse.answers
   for(let i=0;i<answers.length;i++){
   if(answers[i].answer===quiz.quizQuestions[i].correctAnswer){
    score++;
  createdResponse.correctAnswersI.push(i);
   }
   }
   let scorePrecentage=(score/quiz.quizQuestions.length)*100;
   if(scorePrecentage>75)
  createdResponse.pass=true;
    

   
 let module= await this.moduleModel.findById(quiz.Module_id);
let course=await this.courseModel.findById(module.courseId);
 let progress=await this.progressModel.findOne({user_id:createdResponse.user_id,course_id:module.courseId});

 let diff = module.difficulty;
//let avgScore=score/
 if(createdResponse.nextLevel){

  if(diff==="Beginner"&&progress.performanceMetric==="Beginner"){
    progress.performanceMetric="Intermediate";
    await progress.save();
    course.BeginnerCount--;
    course.IntermediateCount++;
    course.save();
  }


  if(diff==="Intermediate"&&progress.performanceMetric==="Intermediate"){
    progress.performanceMetric="Advanced";
    course.completed+=1;
    await progress.save();
    course.IntermediateCount--;
    course.AdvancedCount++;
    course.save();
  }


 }
  
   createdResponse.score=scorePrecentage;
   return createdResponse.save();

  }

  async findAll(): Promise<responseDocument[]> {
    let responses=await this.responseModel.find();
    return responses;
  }

  async findById(id: string): Promise<responseDocument> {
    return await this.responseModel.findById(id);
  }
  

  async findByQuizId(quizId:  mongoose.Types.ObjectId): Promise<responseDocument | null> {
    return await this.responseModel.findOne({quiz_id: quizId }).exec();
  }
  
  async delete(id: string): Promise<responseDocument> {
   return  await this.responseModel.findByIdAndDelete(id);
  }
  async update(id: string, updateData: UpdateResponseDto): Promise<responseDocument> {
    return await this.responseModel.findByIdAndUpdate(id, updateData, { new: true });  
}

}
