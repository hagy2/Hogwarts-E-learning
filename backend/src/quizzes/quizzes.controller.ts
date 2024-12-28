import { Body, Controller, Delete, Get, Param, Post, Put,UseGuards,Query } from '@nestjs/common';
import { createQuizDTo } from './dto/creatquiz.dto';
import { UpdateQuizDto } from './dto/updatequiz.dto';
import { Quiz,quizDocument } from '../quizzes/models/quizzes.schema';
import {questions} from '../questions/models/questions.schema'
import {Module,ModuleDocument} from '../module/models/module.schema';
import { QuizzesService } from './quizzes.service';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UserRole } from 'src/user/models/user.schema';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/authorization.guard';
@UseGuards(AuthGuard)
@Controller('quizzes')
export class QuizzesController {
   constructor(private QuizzesService: QuizzesService) { }

   @Get('by-module-and-user')
   async findByModuleAndUser(
     @Query('moduleId') moduleId: string,
     @Query('userId') userId: string,
   ): Promise<quizDocument> {
     if (!moduleId || !userId) {
       throw new Error('Module ID and User ID must be provided.');
     }
     return this.QuizzesService.findByModuleAndUserId(moduleId, userId);
   }
 
    @Get(':id')
    async getCourseById(@Param('id') id: string):Promise<quizDocument>{
        const quiz = await this.QuizzesService.findById(id);
        return quiz;
    }

   
    @Post()
    async createCourse(@Body()quizData: createQuizDTo):Promise<quizDocument> {
        const newQuiz = await this.QuizzesService.create(quizData);
        return newQuiz;
    }
   
   @Put(':id')
    async updateQuiz(@Param('id') id:string,@Body()quizData: UpdateQuizDto):Promise<quizDocument> {
        const updatedQuiz = await this.QuizzesService.update(id, quizData);
        return updatedQuiz;      
    }
   
    @Delete(':id')
    async deleteQuiz(@Param('id')id:string):Promise<quizDocument> {
        const deletedQuiz = await this.QuizzesService.delete(id);
       return deletedQuiz;
    }

}
