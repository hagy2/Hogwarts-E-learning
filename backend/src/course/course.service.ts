import { Injectable, NotFoundException, ForbiddenException,InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './models/course.schema';
import { CreateCourseDTO } from './dto/create-course.dto';
import { UpdateCourseDTO } from './dto/update-course.dto';
import { UserRole } from '../user/models/user.schema';
import { UserService } from 'src/user/user.service';
import * as mongoose from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    private readonly userService: UserService,
  ) {}

  // Create a new course
  async create(createCourseDto: CreateCourseDTO, userId: string, userRole: UserRole): Promise<Course> {
    if (userRole !== UserRole.Instructor && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only instructors or admins can create courses');
    }

    const createdCourse = new this.courseModel({
      ...createCourseDto,
      createdBy: new mongoose.Types.ObjectId(userId), // Automatically set createdBy from logged-in user
      keywords: createCourseDto.keywords || [],
      ratingCount: 0,
      averageRating: 0,
      isOutdated: false, 
      isAvailable: true, 
    });
    return createdCourse.save();
  }
  // Find all courses 
  async findAll(userRole: UserRole): Promise<Course[]> {
    if (userRole === UserRole.Student) {
      // Students can only see courses that are available and not outdated
      return this.courseModel.find({ isAvailable: true, isOutdated: false }).exec();
    }
    // Admins and instructors can see all courses
    return this.courseModel.find().exec();
  }

  // Find a single course (consider flags and user role)
  async findOne(id: string, userRole: UserRole): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    // Students cannot access outdated or unavailable courses
    if (userRole === UserRole.Student && (!course.isAvailable || course.isOutdated)) {
      throw new NotFoundException('Course is not accessible');
    }

    return course;
  }

  // Update a course (only for instructors or admins)
  async update(id: string, updateCourseDto: UpdateCourseDTO, userRole: UserRole): Promise<Course> {
    if (userRole !== UserRole.Instructor && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only instructors or admins can update courses');
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, {
      new: true,
    });
    if (!updatedCourse) throw new NotFoundException('Course not found');
    return updatedCourse;
  }

  // Add a rating to a course
  async addRating(courseId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, rating: number): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (!course.isAvailable || course.isOutdated) {
      throw new ForbiddenException('Cannot rate an unavailable or outdated course');
    }

    const isEnrolled = await this.userService.hasCourse(userId.toString(), courseId.toString());
    if (!isEnrolled) {
      throw new ForbiddenException('You must be enrolled in the course to rate it');
    }

    course.ratingCount += 1;
    course.averageRating =
      ((course.averageRating * (course.ratingCount - 1)) + rating) / course.ratingCount;

    return course.save();
  }

  // Soft delete a course (mark as unavailable)
  async remove(id: string): Promise<void> {
    const course = await this.courseModel.findByIdAndUpdate(
      id,
      { isAvailable: false },
      { new: true },
    );
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  }
  async search(keyword: string, userRole: UserRole): Promise<Course[]> {
    try {
      console.log('Search keyword:', keyword);
      console.log('User role:', userRole);
  
      const searchCriteria: any = {
        keywords: { $regex: keyword, $options: 'i' },
      };
  
      if (userRole === UserRole.Student) {
        searchCriteria.isAvailable = true;
        searchCriteria.isOutdated = false;
      }
  
      console.log('Search criteria:', searchCriteria);
      const results = await this.courseModel.find(searchCriteria).exec();
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Error during search:', error.message);
      throw new InternalServerErrorException('An error occurred while searching for courses');
    }
  }
  async searchByName(name: string, userRole: UserRole): Promise<Course[]> {
    console.log('Search name:', name); // Log the query name
  
    const searchCriteria: any = {
      name: { $regex: name, $options: 'i' }, // Case-insensitive partial match
    };
  
    if (userRole === UserRole.Student) {
      searchCriteria.isAvailable = true;
      searchCriteria.isOutdated = false;
    }
  
    console.log('Search criteria:', searchCriteria); // Log the criteria
  
    const results = await this.courseModel.find(searchCriteria).exec();
    console.log('Search results:', results); // Log the results
  
    return results;
  }
  
  
}
