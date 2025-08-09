import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Club, ClubDocument } from './schema/club.schema';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubService {
  constructor(@InjectModel(Club.name) private clubModel: Model<ClubDocument>) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    return this.clubModel.create(createClubDto);
  }

  async findAll(): Promise<Club[]> {
    return this.clubModel.find().exec();
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.clubModel.findById(id);
    if (!club) {
      throw new NotFoundException('Club not found');
    }
    return club;
  }

  async update(id: string, updateClubDto: UpdateClubDto): Promise<Club> {
    const updatedClub = await this.clubModel.findByIdAndUpdate(id, updateClubDto, { new: true });
    if (!updatedClub) {
      throw new NotFoundException('Club not found');
    }
    return updatedClub;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedClub = await this.clubModel.findByIdAndDelete(id);
    if (!deletedClub) {
      throw new NotFoundException('Club not found');
    }
    return { message: 'Club deleted successfully' };
  }
}
