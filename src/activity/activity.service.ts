import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from './schema/schema.activity';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = new this.activityModel(createActivityDto);
    return activity.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    title?: string,
    performBy?: string,
    className?: string,
    section?: string,
    type?: string,
  ): Promise<{
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    currentLimit: number;
    data: Activity[];
  }> {
    limit = limit > 0 ? limit : 10;
    page = page > 0 ? page : 1;

    const filter: any = {};

    if (title) filter.title = { $regex: title, $options: 'i' };
    if (performBy) filter.performBy = performBy;
    if (className) filter.className = className;
    if (section) filter.section = section;
    if (type) filter.type = type;

    const totalRecords = await this.activityModel.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    const data = await this.activityModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      totalRecords,
      totalPages,
      currentPage: page,
      currentLimit: limit,
      data,
    };
  }

  async findOne(id: string): Promise<Activity> {
    return this.activityModel.findById(id).exec();
  }

  async delete(id: string): Promise<Activity> {
    return this.activityModel.findByIdAndDelete(id).exec();
  }
}