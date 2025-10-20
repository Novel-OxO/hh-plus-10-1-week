import { Module } from '@nestjs/common';

import { PointModule } from '@/modules/point.module';

@Module({
  imports: [PointModule],
})
export class AppModule {}
