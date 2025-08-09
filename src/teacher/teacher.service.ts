import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Course } from 'src/course/schema/course.schema';
import { Teacher } from './schema/schema.teacher';
import { UpdateTeacherDto } from './dto/update-teaacher.dto';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { ResponseDto } from 'src/dto/response.dto';
import * as bcrypt from 'bcrypt';
import { Department } from 'src/department/schema/department.schema';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Course>,
  ) {}

  async addTeacher(
    createTeacherDto: CreateTeacherDto,
  ): Promise<Teacher | ResponseDto> {
    const existingTeacher = await this.teacherModel.findOne({
      email: createTeacherDto.email,
    });

    if (existingTeacher) {
      return {
        status: HttpStatus.CONFLICT,
        msg: `Teacher with this ${createTeacherDto.email} already exists`,
      };
    }

    const newTeacher = new this.teacherModel(createTeacherDto);
    return newTeacher.save();
  }

  async updateTeacher(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const existingTeacher = await this.teacherModel.findById(id);
    if (!existingTeacher) {
      throw new NotFoundException('Teacher not found');
    }
    return this.teacherModel.findByIdAndUpdate(id, updateTeacherDto, {
      new: true,
    });
  }
  async assignCourseToTeacher(
    teacherId: string,
    courseId: string,
  ): Promise<{ teacher: Teacher; course: Course }> {
    const teacher = await this.teacherModel.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (teacher.assignedCourses.includes(courseId)) {
      throw new NotFoundException('Course already assigned to this teacher');
    }

    const session = await this.teacherModel.db.startSession();
    session.startTransaction();

    try {
      const updatedTeacher = await this.teacherModel.findByIdAndUpdate(
        teacherId,
        { $addToSet: { assignedCourses: courseId } },
        { new: true, session },
      );

      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { assigned: true },
        { new: true, session },
      );

      await session.commitTransaction();
      await session.endSession();

      return { teacher: updatedTeacher, course: updatedCourse };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error('Failed to assign course to teacher');
    }
  }

  async getAssignedCoursesForTeacher(teacherId: string): Promise<Course[]> {
    const teacher = await this.teacherModel
      .findById(teacherId)
      .select('assignedCourses');

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const courses = await this.courseModel.find({
      _id: { $in: teacher.assignedCourses },
    });

    return courses;
  }
  async getUnassignedCoursesByTeacherId(teacherId: string): Promise<any> {
    // Step 1: Get the teacher and their department name
    const teacher = await this.teacherModel
      .findById(teacherId)
      .select('department');
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Step 2: Find the department by its name
    const department = await this.departmentModel.findOne({
      departmentName: teacher.department,
    });
    if (!department) {
      throw new NotFoundException(
        'Department not found for name: ' + teacher.department,
      );
    }

    // Step 3: Fetch unassigned courses that match the department ID
    const unassignedCourses = await this.courseModel.find({
      // assigned: false,
      departmentId: department._id,
    });

    return unassignedCourses;
  }

  async removeCourseAssignment(
    teacherId: string,
    courseId: string,
  ): Promise<{ teacher: Teacher; course: Course }> {
    // Add validation at the start
    // if (!isValidObjectId(teacherId)) {
    //   throw new BadRequestException('Invalid teacher ID format');
    // }
    // if (!isValidObjectId(courseId)) {
    //   throw new BadRequestException('Invalid course ID format');
    // }

    // Verify teacher exists
    const teacher = await this.teacherModel.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Verify course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if course is actually assigned
    const courseIndex = teacher.assignedCourses.findIndex(
      (id) => id.toString() === courseId,
    );

    if (courseIndex === -1) {
      throw new BadRequestException(
        `Course ${courseId} is not assigned to teacher ${teacherId}`,
      );
    }

    const session = await this.teacherModel.db.startSession();
    session.startTransaction();

    try {
      // Remove course from teacher's array
      const updatedTeacher = await this.teacherModel.findByIdAndUpdate(
        teacherId,
        { $pull: { assignedCourses: courseId } },
        { new: true, session },
      );

      // Update course status
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { assigned: false },
        { new: true, session },
      );

      await session.commitTransaction();
      return { teacher: updatedTeacher, course: updatedCourse };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Failed to unassign course: ' + error.message,
      );
    } finally {
      session.endSession();
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    const teacher = await this.teacherModel.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID "${id}" not found.`);
    }

    await this.teacherModel.findByIdAndDelete(id);

    return { message: 'Teacher deleted successfully.' };
  }

  async findOne(id: string): Promise<Teacher> {
    return this.teacherModel.findById(id, '-password -updatedAt');
  }

  async findAll(
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
    department?: string,
    email?: string,
  ) {
    const skip = (page - 1) * limit;

    // Define filter conditions
    const filter: any = {};

    if (department) {
      filter.department = department; // Fixed class filtering
    }

    if (email) {
      filter.email = email; // Fixed class filtering
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate); // Greater than or equal to start date
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate); // Less than or equal to end date
      }
    }

    const totalRecordsCount = await this.teacherModel.countDocuments(filter);
    const teachers = await this.teacherModel
      .find(filter, '-password -updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: teachers,
      totalPages: Math.ceil(totalRecordsCount / limit),
      totalRecordsCount,
      currentPage: page,
      limit,
    };
  }

  async importStudents(filePath: string): Promise<any> {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const teachers: any[] = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheetName],
      );

      if (teachers.length > 1000) {
        return {
          status: HttpStatus.CONFLICT,
          msg: 'Limit exceeded: Maximum 1000 records allowed at a time.',
        };
      }

      const emails = teachers.map((s) => s.email);

      const existingStudents = await this.teacherModel.find({
        $or: [{ email: { $in: emails } }],
      });

      const existingTeachersByEmail = new Map(
        existingStudents.map((s) => [s.email, s]),
      );

      const validTeachers = [];

      // ✅ Use `for...of` instead of `.forEach()` to properly handle async calls
      for (const [i, student] of teachers.entries()) {
        const { email } = student;
        const rowNumber = i + 2; // Adjusting for header row

        if (existingTeachersByEmail.has(email)) {
          const existingStudent = existingTeachersByEmail.get(email);
          return {
            status: HttpStatus.CONFLICT,
            msg: `Row ${rowNumber}: Teacher email "${email}" is already registered with ${existingStudent.firstName} ${existingStudent.lastName}.`,
          };
        }

        validTeachers.push(student);
      }

      if (validTeachers.length === 0) {
        return {
          status: HttpStatus.CONFLICT,
          msg: `No valid records to insert. All entries already exist.`,
        };
      }

      await this.teacherModel.insertMany(validTeachers);

      return {
        message: `${validTeachers.length} Teachers imported successfully.`,
      };
    } catch (error) {
      console.error('Error importing teachers:', error);

      // ✅ Ensure proper error handling
      if (error instanceof ConflictException) {
        return {
          status: HttpStatus.CONFLICT,
          msg: error.message,
        };
      }

      return {
        status: HttpStatus.CONFLICT,
        msg: error.message,
      };
    } finally {
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
    }
  }

  async validateTeacher(data: { email: string; password: string }) {
    try {
      const teacher = await this.teacherModel.findOne({ email: data.email });
      if (!teacher) return null;

      const isMatch = await bcrypt.compare(data.password, teacher.password);
      console.log(teacher);
      return isMatch ? teacher : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
