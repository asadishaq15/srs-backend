import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseOutline,
  CourseOutlineDocument,
} from './schema/course-outline.schema';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseOutlineDto } from './dto/create-course-outline.dto';

@Injectable()
export class CourseOutlineService {
  constructor(
    @InjectModel(CourseOutline.name)
    private courseOutlineModel: Model<CourseOutlineDocument>,
  ) {}

  async create(dto: CreateCourseOutlineDto): Promise<CourseOutline> {
    try {
      const created = new this.courseOutlineModel(dto);
      return await created.save();
    } catch (error) {
      throw error;
    }
  }

  async findAllByTeacherId(
    teacherId: string,
    status?: string,
  ): Promise<CourseOutline[]> {
    try {
      // Build the query object
      const query: any = { teacherId }; // Filter by teacherId

      if (status) {
        query.status = status; // Optionally filter by status if provided
      }

      return await this.courseOutlineModel.find(query).exec(); // Use the query to find the relevant course outlines
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve course outlines',
      );
    }
  }

  async findAll(): Promise<CourseOutline[]> {
    try {
      return await this.courseOutlineModel.find().exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve course outlines',
      );
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.courseOutlineModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Course outline not found');
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<CourseOutline> {
    try {
      const updated = await this.courseOutlineModel.findByIdAndUpdate(
        id,
        { status: dto.status },
        { new: true },
      );
      if (!updated) throw new NotFoundException('Course outline not found');
      return updated;
    } catch (error) {
      throw error;
    }
  }
}

export class UpdateStatusDto {
  status: string;
}
