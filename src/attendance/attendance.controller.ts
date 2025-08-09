import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance } from './schema/schema.attendance';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('markAttendance')
  async markAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendanceService.markAttendance(createAttendanceDto);
  }

  @Get('/getTeacherViewAttendance')
  async getTeacherViewAttendance(
    @Query('room') room: string,
    @Query('section') section: string,
    @Query('date') date: string,
    @Query('courseId') courseId: string,
    @Query('teacherId') teacherId?: string,
  ): Promise<Attendance[]> {
    return this.attendanceService.getTeacherViewAttendance(
      courseId,
      room,
      section,
      date,
      teacherId,
    );
  }
}
