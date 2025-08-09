import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { Parent, ParentSchema } from './schema/parent.schema';

import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Parent.name, schema: ParentSchema }]),
    ScheduleModule, // Just import it, do not add service to providers
  ],
  controllers: [ParentController],
  providers: [ParentService], // <-- Remove ScheduleService here
  exports: [ParentService],
})
export class ParentModule {}