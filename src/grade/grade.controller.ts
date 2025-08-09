import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { CreateGradeListDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Controller('grade')
export class GradeController {
  constructor(private readonly service: GradeService) {}

  @Post('createGrade')
  create(@Body() dto: CreateGradeListDto) {
    return this.service.create(dto.grades);
  }

  @Get('getStudentGrades')
  findAll(
    @Query('class') className: string,
    @Query('section') section: string,
    @Query('courseId') courseId: string,
    @Query('teacherId') teacherId: string,
    @Query('term') term?: string,
  ) {
    return this.service.findAll(className, section, courseId, teacherId,term);
  }
  @Get('by-student/:studentId')
async getGradesByStudent(@Param('studentId') studentId: string) {
  // Returns all grades for this student, with course & teacher populated
  return this.service.findAllByStudent(studentId);
}

  @Get('student-course')
  findGradesByStudentAndCourse(
    @Query('courseId') courseId: string,
    @Query('studentId') studentId: string,
  ) {
    return this.service.findGradesByStudentAndCourse(studentId, courseId);
  }
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.service.findOne(id, className, section, courseId, teacherId);
  }

  @Patch('update')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateGrades(@Body() updateGradeListDto: UpdateGradeDto[]) {
    return this.service.updateMany(updateGradeListDto);
  }

  @Delete('delete')
  remove(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.service.remove(className, section, courseId, teacherId);
  }
}
