import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher, TeacherSchema } from './schema/schema.teacher'; 
import { Course, CourseSchema } from 'src/course/schema/course.schema'; 
import { Department, DepartmentSchema } from 'src/department/schema/department.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: Course.name, schema: CourseSchema }, 
     { name: Department.name, schema: DepartmentSchema },

    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
