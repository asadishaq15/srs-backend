import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Absence, AbsenceDocument } from './schema/absence.schema';
import { Model, Types } from 'mongoose';
import { CreateAbsenceDto } from './dto/create-absence.dto';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectModel(Absence.name)
    private readonly absenceModel: Model<AbsenceDocument>
  ) {}

  /**
   * Create a new absence report for a student.
   */
  async create(createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    // Optionally, validate that the student exists, etc.
    return await this.absenceModel.create({
      ...createAbsenceDto,
      student: new Types.ObjectId(createAbsenceDto.student),
      status: 'pending',
      submittedAt: new Date(),
    });
  }

  /**
   * Get all absences for a given student (by student ObjectId string).
   */
  async findByStudent(studentId: string): Promise<Absence[]> {
    if (!Types.ObjectId.isValid(studentId)) throw new BadRequestException('Invalid studentId');
    return this.absenceModel
      .find({ student: studentId })
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Get all absences for all children of a parent.
   * Useful for parent dashboards (requires ParentService or model).
   */
  async findByParent(parentId: string): Promise<Absence[]> {
    const ParentModel = this.absenceModel.db.model('Parent') as Model<any>;
  
    interface ParentWithChildren {
      children?: Array<{ _id: any } | string>;
    }
  
    const parent = await ParentModel
      .findById(parentId)
      .populate('children')
      .lean<ParentWithChildren | null>();
  
    if (!parent) throw new NotFoundException('Parent not found');
  
    const studentIds = (parent.children ?? []).map(child =>
      typeof child === 'string' ? child : child._id
    );
  
    if (studentIds.length === 0) return [];
  
    return this.absenceModel
      .find({ student: { $in: studentIds } })
      .sort({ date: -1 })
      .exec();
  }
  
  /**
   * Parent may want to see all absences for all their children, grouped by student.
   */
  async findByParentGrouped(parentId: string): Promise<{ [studentId: string]: Absence[] }> {
    const absences = await this.findByParent(parentId);
    const grouped: { [studentId: string]: Absence[] } = {};
    for (const abs of absences) {
      const sid = abs.student.toString();
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(abs);
    }
    return grouped;
  }

  /**
   * (Optional) Update the status of an absence (e.g., approve/reject by admin).
   */
  async updateStatus(absenceId: string, status: 'pending' | 'approved' | 'rejected'): Promise<Absence> {
    if (!Types.ObjectId.isValid(absenceId)) throw new BadRequestException('Invalid absenceId');
    const absence = await this.absenceModel.findById(absenceId);
    if (!absence) throw new NotFoundException('Absence not found');
    absence.status = status;
    await absence.save();
    return absence;
  }

  /**
   * (Optional) Get all absences with filters (date range, status, etc).
   */
  async findAll(filters: {
    studentId?: string;
    parentId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    page?: number;
  }) {
    const query: any = {};
    if (filters.studentId) query.student = filters.studentId;
    if (filters.status) query.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      query.date = {};
      if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.date.$lte = new Date(filters.toDate);
    }
  
    let studentIds: string[] = [];
    if (filters.parentId) {
      const ParentModel = this.absenceModel.db.model('Parent') as Model<any>;
  
      // type describing the shape we expect after populate().lean()
      interface ParentWithChildren {
        children?: Array<{ _id: any } | string>;
      }
  
      const parent = await ParentModel
        .findById(filters.parentId)
        .populate('children')
        .lean<ParentWithChildren | null>();
  
      if (!parent) throw new NotFoundException('Parent not found');
  
      studentIds = (parent.children ?? []).map(child =>
        typeof child === 'string' ? child : child._id
      );
  
      query.student = { $in: studentIds };
    }
  
    const limit = filters.limit ? Number(filters.limit) : 20;
    const skip = filters.page ? (Number(filters.page) - 1) * limit : 0;
  
    return this.absenceModel
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * (Optional) Admin can delete an absence report.
   */
  async delete(absenceId: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(absenceId)) throw new BadRequestException('Invalid absenceId');
    const result = await this.absenceModel.deleteOne({ _id: absenceId });
    return { deleted: result.deletedCount === 1 };
  }
}