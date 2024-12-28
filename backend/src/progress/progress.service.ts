import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Quiz,quizDocument,quizzesSchema } from '../quizzes/models/quizzes.schema';
import {questions} from '../questions/models/questions.schema'
import {Module,ModuleDocument} from '../module/models/module.schema';//dep
import { Progress,progressDocument } from './models/progress.schema';
import { Course } from 'src/course/models/course.schema';//dep
import { UpdateProgressDto } from './dto/updateProgress.dto';
import { Response } from 'src/responses/models/responses.schema';


@Injectable()
export class ProgressService {

    constructor(
        @InjectModel(Progress.name) private progressModel: mongoose.Model<Progress>,
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(Module.name) private readonly moduleModel: Model<Module>,
        @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
        @InjectModel(Response.name)private readonly responseModel:Model<Response>
    ) {}

   
      async create(progressData: Progress): Promise<progressDocument> {
        const newProgress= new this.progressModel(progressData); 
        const Course=await this.courseModel.findById(newProgress.course_id);
        const totalModules = await this.moduleModel.countDocuments({ course_id: newProgress.course_id });
        const accessedModulesCount=newProgress.accessed_modules.length;
        let accessedModules ;
        if(newProgress.performanceMetric==="Intermediate")
            accessedModules = await this.moduleModel.find({
                $and: [
                  { course_id: newProgress.course_id },
                  {
                    $or: [

                      { difficulty: newProgress.performanceMetric },
                      { difficulty: 'Beginner' }
                    ]
                  }
                ]
              });


             else{ if(newProgress.performanceMetric==="Advanced")
                accessedModules = await this.moduleModel.find({course_id: newProgress.course_id });
                else{
                    accessedModules = await this.moduleModel.find({course_id: newProgress.course_id,difficulty:"Beginner" });
                }
             } 

      
            

             if(totalModules!=0)
             newProgress.completion_percentage=(accessedModulesCount/totalModules)*100;

             else newProgress.completion_percentage=0;
            
             
             for(let i=0;i<newProgress.accessed_modules.length;i++){
              let module=  await this.moduleModel.findById(newProgress.accessed_modules[i]);
             }

             if(totalModules!=0)
             newProgress.avgScore=(newProgress.totalScores/(totalModules*100));

             else  newProgress.avgScore=0;
             
             
        return await newProgress.save(); 

    }



    async findAll(): Promise<progressDocument[]> {
        let responses=await this.progressModel.find();
        return responses;
      }

      async findByUserIdAndCourseId(
        userId: string,
        courseId: string,
      ): Promise<progressDocument | null> {
        const progress = await this.progressModel.findOne({ user_id: userId, course_id: courseId });
        if (!progress) {
          console.error(`Progress not found for user ${userId} and course ${courseId}`);
        }
        return progress;
      }
    
      async findById(id: string): Promise<progressDocument> {
        return await this.progressModel.findById(id);
      }
    
      async delete(id: string): Promise<progressDocument> {
       return  await this.progressModel.findByIdAndDelete(id);
      }async update(id: string, updateData: UpdateProgressDto): Promise<progressDocument | null> {
        // Find the existing progress document
        const existingProgress = await this.progressModel.findById(id);
        if (!existingProgress) {
            console.error(`Progress with ID ${id} not found`);
            return null;
        }
    
        // Update fields directly from updateData
        Object.assign(existingProgress, updateData);
    
        // Recalculate completion percentage if accessed_modules is updated
        if (updateData.accessed_modules) {
            const totalModules = await this.moduleModel.countDocuments({ course_id: existingProgress.course_id });
            const accessedModulesCount = updateData.accessed_modules.length;
    
            existingProgress.completion_percentage =
                totalModules !== 0 ? (accessedModulesCount / totalModules) * 100 : 0;
        }
    
        // Recalculate average score if totalScores or totalModules are updated
        if (updateData.totalScores !== undefined || updateData.accessed_modules) {
            const totalModules = await this.moduleModel.countDocuments({ course_id: existingProgress.course_id });
            existingProgress.avgScore =
                totalModules !== 0 ? (existingProgress.totalScores / (totalModules * 100)) : 0;
        }
    
        // Save the updated progress document
        return await existingProgress.save();
    }    
}
