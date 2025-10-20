import { Module } from '@nestjs/common';

import { PointController } from '@/api/point.controller';
import { DatabaseModule } from '@/modules/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
})
export class PointModule {}
