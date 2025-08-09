import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('add')
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  // @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('email') email?: string,
    @Query('teacherId') teacherId?: string,
    @Query('date') date?: string, // accepts: today, yesterday, tomorrow
    @Query('courseId') courseId?: boolean,
  ) {
    return this.scheduleService.findAll(
      +page,
      +limit,
      className,
      section,
      email,
      teacherId,
      date,
      courseId,
    );
  }
  @Get('by-student')
  async getSchedulesByStudentAndDate(
    @Query('studentId') studentId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.findSchedulesByStudentIdAndDate(studentId, date);
  }
  @Get('student-full-schedule')
  async getFullScheduleForStudent(
    @Query('studentId') studentId: string,
  ) {
    return this.scheduleService.findFullScheduleByStudentId(studentId);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  
  @Get('getTotalStudentsAssignedToTeacher/:id')
  async getTotalStudentsAssignedToTeacher(@Param('id') id: string) {
    return this.scheduleService.getTotalStudentsAssignedToTeacher(id);
  }
  @Get('for-student/:id/week')
  async getStudentScheduleWeek(@Param('id') studentId: string) {
    return this.scheduleService.getWeekScheduleForStudent(studentId);
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
