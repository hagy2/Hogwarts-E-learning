import mongoose from "mongoose";

export class UpdateModuleDTO {
  courseId?: string;
  title?: string;
  content?: string;
  mediaFiles?: { filename: string; path: string; mimetype: string }[];
  difficulty?: string;  
    quiz_id?: mongoose.Types.ObjectId; 
     creator?: mongoose.Types.ObjectId;
     keywords?: string[];
       TFcount?: number;
       MCQcount?: number;
       questionBank_id?:mongoose.Types.ObjectId;
       tookQuiz?: number;
       isLast?:boolean;
      
}
