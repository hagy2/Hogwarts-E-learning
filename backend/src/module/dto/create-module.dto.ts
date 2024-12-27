import mongoose from "mongoose";

export class CreateModuleDTO {
  courseId: string;  
  title: string;
  content: string;
  mediaFiles: { filename: string; path: string; mimetype: string }[];
  difficulty: string;  
  quiz_id?: mongoose.Types.ObjectId; 
  questionBank_id?: mongoose.Types.ObjectId;
  creator?: mongoose.Types.ObjectId; 
  keywords: string[];
    TFcount: number;
    MCQcount: number;
      
      tookQuiz: number;
}
