import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Parent } from './schema/parent.schema';
import { AuthGuard } from '../user/guards/auth.guard';
import { ScheduleService } from 'src/schedule/schedule.service';

@Controller('parent')
export class ParentController {
  constructor(
    private readonly parentService: ParentService,
    private readonly scheduleService: ScheduleService, // Inject ScheduleService
  ) {}

  @Post()
  create(@Body() createParentDto: CreateParentDto): Promise<Parent> {
    return this.parentService.create(createParentDto);
  }

  @Get()
  findAll(): Promise<Parent[]> {
    return this.parentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Parent> {
    return this.parentService.findOne(id);
  }
    // GET /parent/:id/children-full (returns full student objects)
    // @UseGuards(AuthGuard)
    @Get(':id/children-full')
    async getChildrenFull(@Param('id') id: string) {
      return this.parentService.getChildrenFull(id);
    }

//   @UseGuards(AuthGuard)
  @Get(':id/children')
  async getChildren(@Param('id') id: string) {
    return this.parentService.getChildrenIds(id);
  }
  
}