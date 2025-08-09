import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parent, ParentDocument } from './schema/parent.schema';
import { CreateParentDto } from './dto/create-parent.dto';
import { Student } from '../student/schema/student.schema';
import { ParentLoginDto } from './dto/parent-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentService {
  constructor(
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createParentDto.password, salt);

    const createdParent = new this.parentModel({
      ...createParentDto,
      password: hashedPassword,
    });
    return createdParent.save();
  }
  async getChildrenFull(parentId: string): Promise<Student[]> {
    const parent = await this.parentModel
      .findById(parentId)
      .populate({
        path: 'children',
        populate: { path: 'guardian' }, // Ensure guardian is populated
      })
      .exec();
    return (parent?.children as unknown as Student[]) || [];
  }

  async findAll(): Promise<Parent[]> {
    return this.parentModel.find().exec();
  }

  async findOne(id: string): Promise<Parent> {
    return this.parentModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<Parent> {
    return this.parentModel.findOne({ email }).exec();
  }

  async validateParent(loginDto: ParentLoginDto): Promise<Parent | null> {
    const parent = await this.findByEmail(loginDto.email);
    if (!parent) return null;

    const passwordValid = await bcrypt.compare(loginDto.password, parent.password);
    return passwordValid ? parent : null;
  }

  async getChildrenIds(parentId: string): Promise<string[]> {
    const parent = await this.parentModel.findById(parentId).exec();
    return parent?.children || [];
  }
}