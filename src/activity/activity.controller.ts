import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post("add")
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  async findAll(
    page = 1,
    limit = 10,
    title?: string,
    performBy?: string,
    className?: string,
    section?: string,
    type?: string,
  ) {
    // Add className/section/type filters as needed in service
    return this.activityService.findAll(
      Number(page) || 1, 
      Number(limit) || 10, 
      title,
      performBy,
      className,
      section,
      type,
    );
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.activityService.delete(id);
  }
}
