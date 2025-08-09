import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schema/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { isValidObjectId } from 'mongoose';
import {
  Schedule,
  ScheduleDocument,
} from 'src/schedule/schema/schedule.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Schedule.name) private courseSchedule: Model<ScheduleDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { courseName, courseCode, departmentId, ...rest } = createCourseDto;

    const existingCourseByName = await this.courseModel
      .findOne({ courseName })
      .exec();
    if (existingCourseByName) {
      throw new ConflictException('Course name already exists');
    }

    const existingCourseByCode = await this.courseModel
      .findOne({ courseCode })
      .exec();
    if (existingCourseByCode) {
      throw new ConflictException('Course code already exists');
    }

    const newCourseData = { courseName, courseCode, ...rest };

    // Handle departmentId if provided
    if (departmentId) {
      if (!isValidObjectId(departmentId)) {
        throw new BadRequestException('Invalid departmentId format');
      }
      newCourseData['departmentId'] = departmentId;
    }

    try {
      const newCourse = new this.courseModel(newCourseData);
      return await newCourse.save();
    } catch (error) {
      console.error('Error creating course:', error);
      throw new InternalServerErrorException(
        'Failed to create course. Please try again later.',
      );
    }
  }
  async findAll(
    coursename?: string,
    active?: boolean,
    special?: boolean,
  ): Promise<Course[]> {
    const filter: any = {};

    if (coursename) {
      filter.courseName = { $regex: coursename, $options: 'i' };
    }

    if (filter.active) {
      filter.active = active;
    }

    if (filter.special) {
      filter.special = special;
    }

    return this.courseModel.find(filter).populate('departmentId').exec();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('departmentId')
      .exec();
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    // Find the existing course by ID
    const existingCourse = await this.courseModel.findById(id).exec();
    if (!existingCourse) {
      throw new BadRequestException('Course not found');
    }

    // Check if courseName is being updated
    if (
      updateCourseDto.courseName &&
      updateCourseDto.courseName !== existingCourse.courseName
    ) {
      const existingCourseByName = await this.courseModel
        .findOne({ courseName: updateCourseDto.courseName })
        .exec();
      if (existingCourseByName) {
        throw new ConflictException('Course name already exists');
      }
    }

    // Update the course
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    return updatedCourse;
  }

  async remove(id: string): Promise<Course> {
    const session = await this.courseModel.db.startSession();
    session.startTransaction();
    try {
      const deletedCourse = await this.courseModel.findByIdAndDelete(id, {
        session,
      });
      if (!deletedCourse) {
        throw new NotFoundException('Course not found');
      }

      await this.courseSchedule.deleteMany({ courseId: id }, { session });

      // ✅ Commit the transaction if everything is successful
      await session.commitTransaction();
      session.endSession();

      return deletedCourse;
    } catch (error) {
      // ❌ Rollback the transaction if anything fails
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
