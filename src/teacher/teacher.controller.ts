import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher } from './schema/schema.teacher';
import { UpdateTeacherDto } from './dto/update-teaacher.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptionsForXlxs, UploadedFileType } from 'utils/multer.config';
import { ResponseDto } from 'src/dto/response.dto';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('email') email?: string,
  ) {
    return this.teacherService.findAll(
      Number(page),
      Number(limit),
      startDate,
      endDate,
      department,
      email,
    );
  }

  @Post('add')
  async addTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
  ): Promise<Teacher | ResponseDto> {
    return this.teacherService.addTeacher(createTeacherDto);
  }
  @Get('assign-course')
  async assignCourse(
    @Query('teacherId') teacherId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.teacherService.assignCourseToTeacher(teacherId, courseId);
  }
  @Get('get/assignedCourses')
  async getAssignedCourses(@Query('teacherId') teacherId: string) {
    return this.teacherService.getAssignedCoursesForTeacher(teacherId);
  }
  @Get('remove-course')
  async removeCourseAssignment(
    @Query('teacherId') teacherId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.teacherService.removeCourseAssignment(teacherId, courseId);
  }

  @Get('unassigned-courses')
  async getUnassignedCourses(@Query('departmentId') departmentId: string) {
    if (!departmentId) {
      throw new Error('departmentId is required');
    }

    return this.teacherService.getUnassignedCoursesByTeacherId(departmentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Teacher> {
    return this.teacherService.findOne(id);
  }

  @Put(':id')
  async updateTeacher(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.teacherService.updateTeacher(id, updateTeacherDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.teacherService.delete(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', multerOptionsForXlxs))
  async importStudents(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.teacherService.importStudents(file.path);
  }
}
