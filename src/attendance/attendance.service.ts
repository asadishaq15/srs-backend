import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance, AttendanceDocument } from './schema/schema.attendance';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async markAttendance(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    try {
      const exists = await this.attendanceModel.findOne({
        teacherId: createAttendanceDto.teacherId,
        courseId: createAttendanceDto.courseId,
        class: createAttendanceDto.class,
        section: createAttendanceDto.section,
        date: createAttendanceDto.date,
      });

      if (exists) {
        throw new ConflictException('Attendance already marked for this date');
      }

      const attendance = new this.attendanceModel(createAttendanceDto);
      return await attendance.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error);
      }
      console.error('Error marking attendance:', error);
      throw new InternalServerErrorException('Failed to mark attendance');
    }
  }

  async summarizeAttendanceByStatus(data: any[]) {
    try {
      const summary = {
        Present: { count: 0, students: [] },
        Absent: { count: 0, students: [] },
        Late: { count: 0, students: [] },
        Excused: { count: 0, students: [] },
      };

      for (const student of data) {
        const status = student.attendance;
        if (summary[status]) {
          summary[status].count += 1;
          summary[status].students.push(student.studentName);
        }
      }

      const total = data.length;

      const result = Object.entries(summary).map(
        ([status, { count, students }]) => ({
          status,
          percentage: total ? Math.round((count / total) * 100) : 0,
          count,
          students,
        }),
      );
      return result;
    } catch (error) {
      console.error('Error summarizing attendance:', error);
      throw new InternalServerErrorException('Could not summarize attendance');
    }
  }

  async getTeacherViewAttendance(
    courseId: string,
    room: string,
    section: string,
    date: string,
    teacherId?: string,
  ): Promise<Attendance[]> {
    try {
      if (!courseId || !room || !section || !date) {
        throw new BadRequestException('Missing required parameters');
      }

      const filters: any = {
        courseId,
        class: room,
        section,
        date,
      };

      if (teacherId) {
        filters.teacherId = teacherId;
      }

      console.log(filters);

      let result: any = await this.attendanceModel.findOne(filters).exec();

      if (result != null) {
        const attendanceReport = await this.summarizeAttendanceByStatus(
          result['students'],
        );
        result = result.toObject();
        result['attendanceReport'] = attendanceReport;
      }

      return result;
    } catch (error) {
      console.error('Error in getTeacherViewAttendance:', error);
      throw new InternalServerErrorException('Failed to retrieve attendance');
    }
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({ studentId })
      .populate('teacherId courseId')
      .exec();
  }
}
