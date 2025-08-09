import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Department, DepartmentSchema } from './schema/department.schema';
import { Course, CourseSchema } from 'src/course/schema/course.schema';
import { Schedule, ScheduleSchema } from 'src/schedule/schema/schedule.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Department.name, schema: DepartmentSchema },
    { name: Course.name, schema: CourseSchema },
    { name: Schedule.name, schema: ScheduleSchema }
  ])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
