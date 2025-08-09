import { Controller, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post('submit')
  async create(@Body() dto: CreateAbsenceDto) {
    return this.absenceService.create(dto);
  }

  @Get('student')
  async findByStudent(@Query('studentId') studentId: string) {
    return this.absenceService.findByStudent(studentId);
  }

  @Get('parent')
  async findByParent(@Query('parentId') parentId: string) {
    return this.absenceService.findByParent(parentId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: 'pending' | 'approved' | 'rejected' }
  ) {
    return this.absenceService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.absenceService.delete(id);
  }
}