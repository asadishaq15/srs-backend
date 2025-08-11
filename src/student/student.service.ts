import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student } from './schema/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as XLSX from 'xlsx';
import { ResponseDto } from 'src/dto/response.dto';
import { Attendance } from '../attendance/schema/schema.attendance';
import { Course } from 'src/course/schema/course.schema';
import { Parent } from '../parent/schema/parent.schema';
import { UploadedFileType } from 'utils/multer.config';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  calculateGraduationDate(enrollDate: string): string {
    const date = new Date(enrollDate);
    date.setFullYear(date.getFullYear() + 5);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async bulkUpload(file: UploadedFileType) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const BATCH_SIZE = 100;
      let insertedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const result = await this.processBatch(batch, session);
        insertedCount += result.insertedCount;
        skippedCount += result.skippedCount;
      }

      await session.commitTransaction();
      return { insertedCount, skippedCount };
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Bulk upload failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  private async processBatch(rows: any[], session: ClientSession) {
    let insertedCount = 0;
    let skippedCount = 0;

    const { validStudents, skipped } = await this.prepareStudentData(
      rows,
      session,
    );
    skippedCount += skipped;

    if (validStudents.length === 0) {
      return { insertedCount, skippedCount };
    }

    const studentsWithParents = [];
    for (const student of validStudents) {
      // parentId (or parentIds) must be present in the row
      if (!student.parentIds || !Array.isArray(student.parentIds) || student.parentIds.length === 0) {
        skippedCount++;
        continue;
      }
      // Ensure all parents exist
      let allParentsExist = true;
      for (const parentId of student.parentIds) {
        const parent = await this.parentModel.findById(parentId).session(session);
        if (!parent) {
          allParentsExist = false;
          break;
        }
      }
      if (!allParentsExist) {
        skippedCount++;
        continue;
      }
      studentsWithParents.push({
        ...student,
        parents: student.parentIds,
      });
    }

    await this.studentModel.insertMany(studentsWithParents, { session });
    insertedCount += studentsWithParents.length;

    return { insertedCount, skippedCount };
  }

  private async prepareStudentData(rows: any[], session: ClientSession) {
    const validStudents: any[] = [];
    let skippedCount = 0;

    const studentEmails = rows.map((row) => row.email).filter(Boolean);

    // Check for existing students in the database
    const existingStudents = await this.studentModel
      .find({ email: { $in: studentEmails } }, { email: 1 }, { session })
      .lean();

    const existingStudentEmails = new Set(existingStudents.map((s) => s.email));

    for (const row of rows) {
      // Skip if student email exists
      if (existingStudentEmails.has(row.email)) {
        skippedCount++;
        continue;
      }

      // Validate required fields
      if (
        !row.email ||
        !row.enrollDate ||
        !row.studentId ||
        !row.parentIds || // should be an array of parent _id(s)
        !Array.isArray(row.parentIds) ||
        row.parentIds.length === 0
      ) {
        skippedCount++;
        continue;
      }

      const studentDto = {
        studentId: row.studentId,
        firstName: row.firstName,
        lastName: row.lastName,
        class: row.Grade, // Mapping from Excel's "Grade" to schema's "class"
        section: row.Section,
        gender: row.Gender,
        dob: row.DOB,
        email: row.email,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergencyContact,
        enrollDate: row.enrollDate,
        expectedGraduation: this.calculateGraduationDate(row.enrollDate),
        profilePhoto: 'N/A',
        transcripts: [],
        iipFlag: false,
        honorRolls: false,
        athletics: false,
        clubs: '',
        lunch: '',
        nationality: '',
        parentIds: row.parentIds, // should be an array of parent _id(s) as strings
      };

      validStudents.push(studentDto);
    }

    return { validStudents, skipped: skippedCount };
  }

  async findByStudentId(studentId: string): Promise<Student> {
    return this.studentModel.findOne({ studentId }).exec();
  }

  async create(
    createStudentDto: CreateStudentDto,
  ): Promise<Student | ResponseDto> {
    const {
      studentId,
      email,
      parents,
      ...studentData
    } = createStudentDto;

    if (!parents || parents.length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        msg: `At least one parent must be provided for the student.`,
      };
    }
    for (const parentId of parents) {
      const parent = await this.parentModel.findById(parentId);
      if (!parent) {
        return {
          status: HttpStatus.BAD_REQUEST,
          msg: `Parent with ID "${parentId}" does not exist.`,
        };
      }
    }

    // Check if studentId already exists
    const existingStudentBystudentId = await this.studentModel.findOne({
      studentId,
    });
    if (existingStudentBystudentId) {
      return {
        status: HttpStatus.CONFLICT,
        msg: `studentId number "${studentId}" is already taken by student ${existingStudentBystudentId.firstName} ${existingStudentBystudentId.lastName}.`,
      };
    }

    // Check if student email already exists
    const existingStudentByEmail = await this.studentModel.findOne({ email });
    if (existingStudentByEmail) {
      return {
        status: HttpStatus.CONFLICT,
        msg: `Student email "${email}" is already registered with ${existingStudentByEmail.firstName} ${existingStudentByEmail.lastName}.`,
      };
    }

    // Hash password (default: 123)
    const hashedPassword = await bcrypt.hash('123', 10);

    // Create Student with Parent IDs
    const student = new this.studentModel({
      ...studentData,
      studentId,
      email,
      password: hashedPassword,
      parents,
    });

    return student.save();
  }

  /**
   * Returns daily attendance records for a student.
   * Each record: { date, status, courseName, checkInTime?, checkOutTime?, reason? }
   */
  async getDailyAttendanceForStudent(studentId: string) {
    const objectId = new Types.ObjectId(studentId);

    // 1. Find all attendance records for this student in any course
    const attendanceRecords = await this.attendanceModel
      .find({ 'students._id': objectId })
      .populate('courseId', 'courseName')
      .select('courseId date students')
      .lean();

    // 2. Flatten all attendance entries into daily records
    const all: Array<{
      date: string;
      status: string;
      courseName: string;
      checkInTime?: string;
      checkOutTime?: string;
      reason?: string;
    }> = [];

    for (const record of attendanceRecords) {
      const courseName = record.courseId?.courseName || 'N/A';
      const date = record.date;
      const studentEntry = (record.students || []).find(
        (s: any) => String(s._id) === String(studentId),
      );
      if (!studentEntry) continue;

      all.push({
        date,
        status: studentEntry.attendance || 'N/A',
        courseName,
        checkInTime: studentEntry.checkInTime,
        checkOutTime: studentEntry.checkOutTime,
        reason: studentEntry.reason,
      });
    }

    // (Optional) You may want to group multiple courses per day and decide how to show status (e.g. "Absent" if any course is absent).
    // For simplicity, just return all records as-is.
    return all;
  }

  async findById(id: string): Promise<Student> {
    return this.studentModel.findById(id).exec();
  }

  async findAll(
    page = 1,
    limit = 10,
    studentId?: string,
    startDate?: string,
    endDate?: string,
    className?: string,
  ) {
    const skip = (page - 1) * limit;

    // Define filter conditions
    const filter: any = {};

    if (studentId) {
      filter.studentId = studentId; // Use direct match if studentId is unique
    }

    if (className) {
      filter.class = className; // Fixed class filtering
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

    const totalRecordsCount = await this.studentModel.countDocuments(filter);
    const students = await this.studentModel
      .find(filter, '-password -updatedAt') // Exclude password and updatedAt fields
      .populate('parents')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: students,
      totalPages: Math.ceil(totalRecordsCount / limit),
      totalRecordsCount,
      currentPage: page,
      limit,
    };
  }

  async studentCount(className: string, section: string) {
    try {
      const count = await this.studentModel.countDocuments({
        class: className,
        section: section,
      });
      return count;
    } catch (error) {
      console.error('Error fetching student count:', error);
      return 0;
    }
  }

  async findOne(id: string): Promise<Student> {
    return this.studentModel
      .findById(id, '-password -updatedAt')
      .populate('parents')
      .exec();
  }

  async delete(id: string): Promise<{ message: string }> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found.`);
    }

    // No more guardian deletion
    await this.studentModel.findByIdAndDelete(id);

    return { message: 'Student deleted successfully.' };
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student | ResponseDto> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found.`);
    }

    // Only update parent if provided
    const { parents, ...studentData } = updateStudentDto;

    if (parents && parents.length > 0) {
      for (const parentId of parents) {
        const parent = await this.parentModel.findById(parentId);
        if (!parent) {
          throw new NotFoundException(`Parent with ID "${parentId}" not found.`);
        }
      }
      // convert string[] to Types.ObjectId[]
      student.parents = parents.map(id => new Types.ObjectId(id));
    }

    Object.assign(student, studentData);
    await student.save();

    return this.studentModel
      .findById(id)
      .populate('parents');
  }

  async getAttendanceByStudentId(studentObjectId: string) {
    const objectId = new Types.ObjectId(studentObjectId);

    const records = await this.attendanceModel
      .find({ 'students._id': objectId })
      .select('courseId students')
      .populate('courseId', 'courseName courseCode');

    const attendanceByCourse: Record<
      string,
      { present: number; total: number; name: string }
    > = {};

    records.forEach((record) => {
      const courseId = (record.courseId as any)._id.toString();
      const courseName = record.courseId.courseName;

      const studentEntry = record.students.find((s: any) =>
        new Types.ObjectId(s._id).equals(objectId),
      );

      if (!studentEntry) return;

      if (!attendanceByCourse[courseId]) {
        attendanceByCourse[courseId] = {
          present: 0,
          total: 0,
          name: courseName,
        };
      }

      if (studentEntry.attendance === 'Present') {
        attendanceByCourse[courseId].present += 1;
      }

      attendanceByCourse[courseId].total += 1;
    });

    const result = Object.entries(attendanceByCourse).map(
      ([courseId, stats]) => ({
        courseId,
        courseName: stats.name,
        attendancePercentage: Math.round((stats.present / stats.total) * 100),
      }),
    );

    return result;
  }

  async getStudentAttendanceByCourseCode(
    courseCode: string,
    studentId: string,
  ) {
    const course = await this.courseModel.findOne({ _id: courseCode });

    if (!course) {
      throw new NotFoundException(`Course with code ${courseCode} not found`);
    }

    const attendanceRecords = await this.attendanceModel
      .find({
        courseId: course._id,
        'students._id': studentId,
      })
      .select('date students');

    const attendanceData = attendanceRecords.map((record) => {
      const student = record.students.find((s: any) =>
        new Types.ObjectId(s._id).equals(studentId),
      );
      return {
        date: record.date,
        status: student?.attendance || 'N/A',
      };
    });

    return [{ courseCode: course.courseCode }, ...attendanceData];
  }

  async validateStudent(data: { email: string; password: string }) {
    try {
      const student = await this.studentModel.findOne({ email: data.email });
      if (!student) return null;

      const isMatch = await bcrypt.compare(data.password, student.password);

      return isMatch ? student : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}