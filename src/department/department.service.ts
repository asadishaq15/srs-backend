import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department, DepartmentDocument } from './schema/department.schema';
import { Course, CourseDocument } from 'src/course/schema/course.schema';
import { Schedule, ScheduleDocument } from 'src/schedule/schema/schedule.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const dp = await this.departmentModel.findOne({departmentName:createDepartmentDto.departmentName})
    if(dp){
        throw new ConflictException('Department already exist');
    }
    
    const department = new this.departmentModel(createDepartmentDto);
    return department.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async update(id: string, updateData: Partial<CreateDepartmentDto>): Promise<Department> {
    return this.departmentModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string): Promise<Department> {
    
    const dp: any = await this.departmentModel.findOne({ _id: id }); // Await here
    if (dp == null) {
        console.log(`Department with ID ${id} not found`);
        throw new BadRequestException('Department not found');
    }

    const course: any = await this.courseModel.find({ departmentId: dp._id }); 
    if (course.length > 0) { 
      throw new BadRequestException('Cannot delete. This department is linked to existing courses.');
    }

    return this.departmentModel.findByIdAndDelete(id);
  }

}
