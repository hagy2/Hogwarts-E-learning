import mongoose, { ObjectId } from "mongoose";
import {UserRole }from "../../../../backend/src/user/models/user.schema";
export interface course{
    _id:ObjectId,
    title: string;
    description: string;
    category: string;
    difficultyLevel: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isOutdated: boolean;
    ratingCount: number;
    averageRating: number;
    BeginnerCount: number;
    IntermediateCount: number;
    AdvancedCount: number;
    keywords:string[];
    isAvailable:boolean;
    completed: number;
    Avg: number;
}

export interface student{
    _id:object,
    name: string;
  email: string;
  passwordHash: string;
  courses: string[];
  role: UserRole;
  profilePictureUrl?: string;
  emailVerified: boolean;
  token: string;
  ratingsc?: number;
  avgRating?: number;

}

export interface admin{
    _id:object,
    name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profilePictureUrl?: string;
  emailVerified: boolean;
  token: string;
  ratingsc?: number;
  avgRating?: number;

}
export interface instructor{
    _id:object,
    name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profilePictureUrl?: string;
  emailVerified: boolean;
  token: string;
  courses: string[];
  ratingsc?:number;
  avgRating?: number;

}

export interface user{
  _id: mongoose.Types.ObjectId,
  name: string;
email: string;
passwordHash: string;
role: UserRole;
courses: string[];
profilePictureUrl?: string;
emailVerified: boolean;
token: string;
ratingsc?: number;
avgRating?: number;

}
export interface module{
 _id:mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId; 
  quiz_id: mongoose.Types.ObjectId; 
  title: string;
  content: string;
  resources: string[]; 
  createdAt: Date;
  difficulty: string;
  questionBank_id: mongoose.Types.ObjectId;
  ratingCount: number; 
  averageRating: number;
  TFcount: number;
  MCQcount: number;
  tookQuiz: number;
} 
export interface quiz{
  _id:mongoose.Types.ObjectId;
  TF:number;
  MCQ:number;
  Module_id: mongoose.Types.ObjectId;
  created_at: Date;  
  quizQuestions: {id:mongoose.Types.ObjectId;question:string;correctAnswer:string}[];
  tookQuiz:number;
  user_id: mongoose.Types.ObjectId;
}

export interface question{
  _id:mongoose.Types.ObjectId;
  tf:{id:mongoose.Types.ObjectId;question:string;correctAnswer:string}[];
  mcq:{id:mongoose.Types.ObjectId;question:string;correctAnswer:string}[];
}
export interface response{
  _id:mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  quiz_id: mongoose.Types.ObjectId;
  answers: { questionId: string; answer: string }[];
  score: number;
  correctAnswersI:number[];
  submittedAt: Date;
  nextLevel: boolean;
  pass: boolean;
}

export interface Progress{
progress_id: string;
user_id: string;
course_id: string;
completion_percentage: number;
last_accessed: Date;
performanceMetric: string;
accessed_modules :  mongoose.Types.ObjectId[];
avgScore: number;



}


