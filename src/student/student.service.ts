import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student } from './schema/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { GuardianService } from '../guardian/guardian.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as XLSX from 'xlsx';
import { Guardian } from '../guardian/schema/guardian.schema';
import { ResponseDto } from 'src/dto/response.dto';
import { Attendance } from '../attendance/schema/schema.attendance';
import { Course } from 'src/course/schema/course.schema';
import { UploadedFileType } from 'utils/multer.config';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private readonly guardianService: GuardianService,
    @InjectModel(Guardian.name) private guardianModel: Model<Guardian>,
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

      console.log(rows);

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

    const guardianData = validStudents.map((student) => ({
      guardianName: student.guardianName,
      guardianEmail: student.guardianEmail,
      guardianPhone: student.guardianPhone,
      guardianRelation: student.guardianRelation,
      guardianProfession: student.guardianProfession,
    }));

    const guardianIds = await this.upsertGuardians(guardianData, session);

    const studentsWithGuardians = validStudents.map((student, index) => ({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      class: student.class,
      section: student.section,
      gender: student.gender,
      dob: student.dob,
      email: student.email,
      phone: student.phone,
      address: student.address,
      emergencyContact: student.emergencyContact,
      enrollDate: student.enrollDate,
      expectedGraduation: student.expectedGraduation,
      guardian: guardianIds[index],
      profilePhoto: 'N/A',
      transcripts: [],
      iipFlag: false,
      honorRolls: false,
      athletics: false,
      clubs: '',
      lunch: '',
      nationality: '',
    }));

    await this.studentModel.insertMany(studentsWithGuardians, { session });
    insertedCount += studentsWithGuardians.length;

    return { insertedCount, skippedCount };
  }

  private async prepareStudentData(rows: any[], session: ClientSession) {
    const validStudents: any[] = [];
    let skippedCount = 0;

    const studentEmails = rows.map((row) => row.email).filter(Boolean);
    const guardianEmails = rows.map((row) => row.guardianEmail).filter(Boolean);

    // Check for existing students and guardians in the database
    const [existingStudents, existingGuardians] = await Promise.all([
      this.studentModel
        .find({ email: { $in: studentEmails } }, { email: 1 }, { session })
        .lean(),
      this.guardianModel
        .find(
          { guardianEmail: { $in: guardianEmails } },
          { guardianEmail: 1 },
          { session },
        )
        .lean(),
    ]);

    const existingStudentEmails = new Set(existingStudents.map((s) => s.email));
    const existingGuardianEmails = new Set(
      existingGuardians.map((g) => g.guardianEmail),
    );

    for (const row of rows) {
      // Skip if student email exists
      if (existingStudentEmails.has(row.email)) {
        skippedCount++;
        continue;
      }

      // Skip if guardian email exists
      if (existingGuardianEmails.has(row.guardianEmail)) {
        skippedCount++;
        continue;
      }

      // Skip if student and guardian have same email
      if (row.email === row.guardianEmail) {
        skippedCount++;
        continue;
      }

      // Validate required fields
      if (
        !row.email ||
        !row.guardianEmail ||
        !row.enrollDate ||
        !row.studentId
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
        guardianName: row.guardianName,
        guardianEmail: row.guardianEmail,
        guardianPhone: row.guardianPhone,
        guardianRelation: row.guardianRelation,
        guardianProfession: row.guardianProfession,
      };

      validStudents.push(studentDto);
    }

    return { validStudents, skipped: skippedCount };
  }

  private async upsertGuardians(guardians: any[], session: ClientSession) {
    if (guardians.length === 0) return [];

    const bulkOps = guardians.map((guardian) => ({
      updateOne: {
        filter: { guardianEmail: guardian.guardianEmail },
        update: {
          $setOnInsert: {
            guardianName: guardian.guardianName,
            guardianEmail: guardian.guardianEmail,
            guardianPhone: guardian.guardianPhone,
            guardianRelation: guardian.guardianRelation,
            guardianProfession: guardian.guardianProfession,
            guardianPhoto: 'N/A',
            password:
              '$2b$10$1VlR8HWa.Pzyo96BdwL0H.3Hdp2WF9oRX1W9lEF4EohpCWbq70jKm',
          },
        },
        upsert: true,
      },
    }));

    await this.guardianModel.bulkWrite(bulkOps, { session });

    const guardianEmails = guardians.map((g) => g.guardianEmail);
    const guardianDocs = await this.guardianModel
      .find(
        { guardianEmail: { $in: guardianEmails } },
        { _id: 1, guardianEmail: 1 },
        { session },
      )
      .lean();

    const emailToIdMap = new Map(
      guardianDocs.map((g) => [g.guardianEmail, g._id]),
    );
    return guardians.map((g) => emailToIdMap.get(g.guardianEmail));
  }

  async findByStudentId(studentId: string): Promise<Student> {
    return this.studentModel.findOne({ studentId }).exec();
  }
  
  async create(
    createStudentDto: CreateStudentDto,
  ): Promise<Student | ResponseDto> {
    const {
      guardianName,
      guardianEmail,
      guardianPhone,
      guardianRelation,
      guardianPhoto,
      guardianProfession,
      studentId,
      email,
      ...studentData
    } = createStudentDto;

    if (guardianEmail === email) {
      return {
        status: HttpStatus.CONFLICT,
        msg: `The student's email cannot be the same as the guardian's email.`,
      };
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

    // Check if guardian email already exists
    const existingGuardianByEmail = await this.guardianModel.findOne({
      guardianEmail,
    });
    if (existingGuardianByEmail) {
      return {
        status: HttpStatus.CONFLICT,
        msg: `Guardian email "${guardianEmail}" is already registered`,
      };
    }

    // Create Guardian First
    const guardian = await this.guardianService.create({
      guardianName,
      guardianEmail,
      guardianPhone,
      guardianPhoto,
      guardianRelation,
      guardianProfession,
    });

    // Hash password (default: 123)
    const hashedPassword = await bcrypt.hash('123', 10);

    // Create Student with Guardian ID
    const student = new this.studentModel({
      ...studentData,
      studentId,
      email,
      password: hashedPassword,
      guardian: guardian._id,
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
      .populate('guardian')
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
      console.log('className', className);
      console.log('section', section);
      const count = await this.studentModel.countDocuments({
        class: className,
        section: section,
      });
      console.log('ount', count)
      return count;
    } catch (error) {
      console.error('Error fetching student count:', error);
      return 0; // or throw error if you want the caller to handle it
    }
  }

  async findOne(id: string): Promise<Student> {
    return this.studentModel
      .findById(id, '-password -updatedAt') // Exclude password and updatedAt fields
      .populate('guardian')
      .exec();
  }

  async delete(id: string): Promise<{ message: string }> {
    const student = await this.studentModel
      .findById(id)
      .populate('guardian')
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found.`);
    }

    // Delete the associated guardian
    await this.guardianService.delete(student.guardian._id.toString());

    // Delete the student
    await this.studentModel.findByIdAndDelete(id);

    return { message: 'Student and associated guardian deleted successfully.' };
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student | ResponseDto> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found.`);
    }

    const {
      guardianName,
      guardianEmail,
      guardianPhone,
      guardianRelation,
      guardianPhoto,
      guardianProfession,
      ...studentData
    } = updateStudentDto;

    // Update Guardian details
    await this.guardianService.update(student.guardian.toString(), {
      guardianName,
      guardianEmail,
      guardianPhone,
      guardianRelation,
      guardianPhoto,
      guardianProfession,
    });

    // Update Student details
    return this.studentModel
      .findByIdAndUpdate(id, studentData, { new: true })
      .populate('guardian');
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
    // Step 1: Find the course by code
    console.log(courseCode);
    console.log(studentId);

    const courseId = new Types.ObjectId(courseCode);
    const course = await this.courseModel.findOne({ _id: courseCode });

    console.log(
      courseCode,
      'is course id ka aaginst ya course aia ha ',
      course,
    );

    if (!course) {
      throw new NotFoundException(`Course with code ${courseCode} not found`);
    }

    // Step 2: Find attendance entries for this course and student
    const attendanceRecords = await this.attendanceModel
      .find({
        courseId: course._id,
        'students._id': studentId,
      })
      .select('date students');

    // Step 3: Extract only the relevant student's attendance per date
    const attendanceData = attendanceRecords.map((record) => {
      const student = record.students.find((s: any) =>
        new Types.ObjectId(s._id).equals(studentId),
      );
      return {
        date: record.date,
        status: student?.attendance || 'N/A',
      };
    });

    // Step 4: Return course code first, then attendance records
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
