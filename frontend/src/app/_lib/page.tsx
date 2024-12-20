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
}