// course-outline.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  CourseOutlineService,
  UpdateStatusDto,
} from './course-outline.service';
import { CreateCourseOutlineDto } from './dto/create-course-outline.dto';
import { CourseOutline } from './schema/course-outline.schema';

@Controller('course-outline')
export class CourseOutlineController {
  constructor(private readonly service: CourseOutlineService) {}

  @Post()
  async create(@Body() dto: CreateCourseOutlineDto) {
    console.log('hit');
    return this.service.create(dto);
  }

  @Get('admin')
  async findAll() {
    return this.service.findAll();
  }

  @Get('teacher')
  async findAllByTeacherId(
    @Query('teacherId') teacherId: string,
    @Query('status') status?: string,
  ): Promise<CourseOutline[]> {
    // Validate teacherId parameter
    if (!teacherId) {
      throw new BadRequestException('teacherId is required');
    }

    // Call the service method with the query parameters
    return this.service.findAllByTeacherId(teacherId, status);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Deleted successfully' };
  }
}
