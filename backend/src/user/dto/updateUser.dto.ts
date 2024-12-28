import { UserRole } from '../models/user.schema';
import { Course } from 'src/course/models/course.schema';

export class UpdateUserDto {
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: UserRole;
    profilePictureUrl?: string;
    courses?: Course[] = [];
    emailVerified?: boolean;
    token?: string;

 ratingsc?: Number;
  avgRating?: Number;
}