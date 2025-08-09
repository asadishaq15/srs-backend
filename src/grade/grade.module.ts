import { Module } from '@nestjs/common';
import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';
import { MongooseModule } from '@nestjs/mongoose'; 
import { Course, CourseSchema } from 'src/course/schema/course.schema';
import { Grade, GradeSchema } from './schema/schema.garde'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Grade.name, schema: GradeSchema },
      { name: Course.name, schema: CourseSchema }, 
    ]),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
