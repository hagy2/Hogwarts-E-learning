import {  forwardRef,Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';  
import { ResponsesController } from './responses.controller';
import { Response,  ResponseSchema } from './models/responses.schema'; 
import { QuizzesModule } from '../quizzes/quizzes.module';
import { ModuleModule } from '../module/module.module';
import { ProgressModule } from 'src/progress/progress.module';
import { CourseModule } from 'src/course/course.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Response.name, schema:  ResponseSchema }]) ,
    HttpModule, 
    QuizzesModule,
    ModuleModule,
    UserModule,
    forwardRef(() => ProgressModule),
        CourseModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '3600s' },
          }),
          inject: [ConfigService],
        }),
 
  ], exports: [MongooseModule,ResponsesService],
  
  providers: [ResponsesService],
  controllers: [ResponsesController]

})
export class ResponsesModule {}
