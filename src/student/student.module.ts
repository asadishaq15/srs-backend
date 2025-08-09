import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './schema/student.schema';
import { GuardianModule } from '../guardian/guardian.module';
import { Guardian, GuardianSchema } from '../guardian/schema/guardian.schema';
import {
  Attendance,
  AttendanceSchema,
} from '../attendance/schema/schema.attendance';
import { Course, CourseSchema } from 'src/course/schema/course.schema';

@Module({
  imports: [
    GuardianModule,
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Guardian.name, schema: GuardianSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
