import { Module } from '@nestjs/common';

import { PointController } from '@/api/point.controller';
import { PointHandler } from '@/application/point-handler';
import { PointService } from '@/application/point.service';
import { DatabaseModule } from '@/modules/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [PointService, PointHandler],
})
export class PointModule {}
