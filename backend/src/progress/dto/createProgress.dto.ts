import mongoose from "mongoose";

export class CreateProgressDto {
    user_id: string;
    course_id: string;
    completion_percentage: number;
    last_accessed: Date;
    performanceMetric: 'Beginner' | 'Intermediate' | 'Advanced';
    accessed_modules :  mongoose.Types.ObjectId[];
    avgScore: number;
    totalScores: number;
    
  }
  