import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentModule } from './student/student.module';
import { GuardianModule } from './guardian/guardian.module';
import { TeacherModule } from './teacher/teacher.module';
import { CourseModule } from './course/course.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DepartmentModule } from './department/department.module';
import { ActivityModule } from './activity/activity.module';
import { ClubModule } from './club/club.module';
import { GlobalModule } from './global/global.module';
import { GradeModule } from './grade/grade.module';
import { UserModule } from './user/user.module';
import { AwsModule } from './aws/aws.module';
import { ParentModule } from './parent/parent.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URL),
    StudentModule,
    GuardianModule,
    TeacherModule,
    CourseModule,
    ScheduleModule,
    AttendanceModule,
    DepartmentModule,
    ActivityModule,
    ClubModule,
    GlobalModule,
    GradeModule,
    UserModule,
    AwsModule,
    ParentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
