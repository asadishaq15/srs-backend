import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schema/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { StudentService } from 'src/student/student.service';
import * as moment from 'moment';
import { ListBucketInventoryConfigurationsOutputFilterSensitiveLog } from '@aws-sdk/client-s3';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly studentService: StudentService,
  ) {}

  private isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const format = (time: string) => {
      const [timeStr, modifier] = time.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const s1 = format(start1);
    const e1 = format(end1);
    const s2 = format(start2);
    const e2 = format(end2);

    return s1 < e2 && s2 < e1;
  }

  async create(
    createScheduleDto: CreateScheduleDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { teacherId, courseId, className, section, dayOfWeek } =
        createScheduleDto;

      // Check for teacher conflicts
      for (const newDay of dayOfWeek) {
        const existingTeacherSchedules = await this.scheduleModel.find({
          teacherId,
          'dayOfWeek.date': newDay.date,
        });

        for (const schedule of existingTeacherSchedules) {
          for (const existingDay of schedule.dayOfWeek) {
            if (existingDay.date === newDay.date) {
              if (
                this.isTimeOverlap(
                  existingDay.startTime,
                  existingDay.endTime,
                  newDay.startTime,
                  newDay.endTime,
                )
              ) {
                return {
                  success: false,
                  message: `Teacher conflict: Teacher already has a class on ${newDay.date} between ${existingDay.startTime} and ${existingDay.endTime}`,
                };
              }
            }
          }
        }
      }

      // Check for classroom conflicts (same class and section at same time)
      for (const newDay of dayOfWeek) {
        const existingClassSchedules = await this.scheduleModel.find({
          className,
          section,
          'dayOfWeek.date': newDay.date,
        });

        for (const schedule of existingClassSchedules) {
          for (const existingDay of schedule.dayOfWeek) {
            if (existingDay.date === newDay.date) {
              if (
                this.isTimeOverlap(
                  existingDay.startTime,
                  existingDay.endTime,
                  newDay.startTime,
                  newDay.endTime,
                )
              ) {
                return {
                  success: false,
                  message: `Classroom conflict: Class ${className}-${section} already has a schedule on ${newDay.date} between ${existingDay.startTime} and ${existingDay.endTime}`,
                };
              }
            }
          }
        }
      }

      // Check for course conflicts (same course shouldn't be scheduled at same time)
      for (const newDay of dayOfWeek) {
        const existingCourseSchedules = await this.scheduleModel.find({
          courseId,
          'dayOfWeek.date': newDay.date,
        });

        for (const schedule of existingCourseSchedules) {
          for (const existingDay of schedule.dayOfWeek) {
            if (existingDay.date === newDay.date) {
              if (
                this.isTimeOverlap(
                  existingDay.startTime,
                  existingDay.endTime,
                  newDay.startTime,
                  newDay.endTime,
                )
              ) {
                return {
                  success: false,
                  message: `Course conflict: This course already has a schedule on ${newDay.date} between ${existingDay.startTime} and ${existingDay.endTime}`,
                };
              }
            }
          }
        }
      }

      // Check if teacher is scheduled for multiple classes at same time in different locations
      // (Assuming you might add classroom/location field later)

      // Check for minimum gap between classes (optional)
      // const MINIMUM_GAP_MINUTES = 15; // Example: 15 minutes between classes
      // You could add this as an additional check in the time overlap function

      const newSchedule = new this.scheduleModel(createScheduleDto);
      await newSchedule.save();

      return {
        success: true,
        message: 'Schedule created successfully.',
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      return {
        success: false,
        message: 'An error occurred while creating the schedule.',
      };
    }
  }
  async findAll(
    page: number,
    limit: number,
    className: string,
    section: string,
    email: string,
    teacherId?: string,
    date?: string,
    courseId?: boolean,
  ): Promise<{ data: Schedule[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (className) filter.className = className;
    if (section) filter.section = section;
    if (email) filter.email = email;
    if (teacherId) filter.teacherId = teacherId;

    if (date) {
      let dayToMatch: string | null = null;

      if (date === 'today') {
        dayToMatch = moment().format('dddd'); // e.g., "Monday"
      } else if (date === 'tomorrow') {
        dayToMatch = moment().add(1, 'day').format('dddd');
      } else if (date === 'yesterday') {
        dayToMatch = moment().subtract(1, 'day').format('dddd');
      }

      if (dayToMatch) {
        filter['dayOfWeek.date'] = dayToMatch;
      }
    }
    const total = await this.scheduleModel.countDocuments({ filter });
    let data;

    if (courseId) {
      data = await this.scheduleModel
        .find(filter)
        .populate('courseId')
        .sort({ createdAt: -1 })
        .exec();
    } else {
      data = await this.scheduleModel
        .find(filter)
        .populate('teacherId')
        .populate('courseId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    return { data, total };
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('teacherId')
      .populate('couseId')
      .exec();
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async findFullScheduleByStudentId(studentId: string) {
    const student = await this.studentService.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');
  
    const filter: any = {
      className: student.class,
      section: this.capitalizeFirstLetter(student.section),
    };
  
    // Get ALL schedules for this class/section
    const schedules = await this.scheduleModel
      .find(filter)
      .populate('teacherId')
      .populate('courseId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  
    return schedules;
  }

  /**
 * Returns the full week's schedule for a student (class/section).
 * Each item: { courseName, teacherName, dayOfWeek, startTime, endTime }
 */
async getWeekScheduleForStudent(studentId: string) {
  const student = await this.studentService.findById(studentId);
  if (!student) throw new NotFoundException('Student not found');

  // Fetch all schedules for class/section
  const schedules = await this.scheduleModel
    .find({
      className: student.class,
      section: student.section,
    })
    .populate('courseId')
    .populate('teacherId')
    .lean();

  // Flatten the schedule: one entry per class slot
  const weekSchedule: Array<{
    courseName: string;
    teacherName: string;
    day: string;
    startTime: string;
    endTime: string;
    note?: string;
  }> = [];

  for (const sched of schedules) {
    const courseName = sched.courseId?.courseName || 'N/A';
    const teacherName = sched.teacherId
      ? `${sched.teacherId.firstName} ${sched.teacherId.lastName}`
      : 'N/A';
    for (const day of sched.dayOfWeek) {
      weekSchedule.push({
        courseName,
        teacherName,
        day: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
        note: sched.note,
      });
    }
  }

  // Sort by day (Monday-Sunday), then startTime
  const dayOrder = [
    'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
  ];
  weekSchedule.sort(
    (a, b) =>
      dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) ||
      a.startTime.localeCompare(b.startTime)
  );

  return weekSchedule;
}
  async findSchedulesByStudentIdAndDate(
    studentId: string,
    date: string,
  ): Promise<Schedule[]> {
    const student = await this.studentService.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');
  
    const filter: any = {
      className: student.class,
      section: this.capitalizeFirstLetter(student.section),
    };
  
    // Special: If date === "all", fetch all!
    if (date && date !== 'all') {
      let dayToMatch: string | null = null;
      if (date === 'today') dayToMatch = moment().format('dddd');
      else if (date === 'tomorrow') dayToMatch = moment().add(1, 'day').format('dddd');
      else if (date === 'yesterday') dayToMatch = moment().subtract(1, 'day').format('dddd');
      else dayToMatch = date; // full day name like "Monday"
  
      if (dayToMatch) {
        filter.dayOfWeek = { $elemMatch: { date: dayToMatch } };
      }
    }
    // else: don't filter by date, fetch all
  
    // Populate course and teacher
    return this.scheduleModel
      .find(filter)
      .populate('courseId')
      .populate('teacherId')
      .exec();
  }

  async getTotalStudentsAssignedToTeacher(id: string) {
    let totalStudents = 0;
    try {
      console.log('id', id);
      const scheduleClasses = await this.scheduleModel
        .find({ teacherId: id })
        .exec();
      console.log(scheduleClasses);

      for (const room of scheduleClasses) {
        const students = await this.studentService.studentCount(
          room.className,
          room.section,
        );
        totalStudents += students;
      }

      const filter: any = { teacherId: id };

      let dayToMatch: string | null = null;

      dayToMatch = moment().format('dddd'); // e.g., "Monday"

      if (dayToMatch) {
        filter['dayOfWeek.date'] = dayToMatch;
      }
      const todayClass = await this.scheduleModel.countDocuments(filter);
      console.log(todayClass);
      return {
        success: true,
        totalStudents,
        todayClasses: todayClass,
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        totalStudents,
        todayClasses: 0,
      };
    }
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const updatedSchedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, { new: true })
      .exec();
    if (!updatedSchedule) {
      throw new NotFoundException('Schedule not found');
    }
    return updatedSchedule;
  }

  async remove(id: string): Promise<Schedule> {
    const deletedSchedule = await this.scheduleModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedSchedule) {
      throw new NotFoundException('Schedule not found');
    }
    return deletedSchedule;
  }
}
