import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { Club, ClubSchema } from './schema/club.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Club.name, schema: ClubSchema }])],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule {}
