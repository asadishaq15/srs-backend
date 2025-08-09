import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schema/course.schema';
import { Schedule, ScheduleSchema } from 'src/schedule/schema/schedule.schema';
import {
  CourseOutline,
  CourseOutlineSchema,
} from './schema/course-outline.schema';
import { CourseOutlineService } from './course-outline.service';
import { CourseOutlineController } from './course-outline-controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: CourseOutline.name, schema: CourseOutlineSchema },
    ]),
  ],
  controllers: [CourseController, CourseOutlineController],
  providers: [CourseService, CourseOutlineService],
  exports: [CourseService, CourseOutlineService],
})
export class CourseModule {}
