import { Module } from '@nestjs/common';

import { PointHistoryTable } from '@/database/pointhistory.table';
import { UserPointTable } from '@/database/userpoint.table';

@Module({
  providers: [UserPointTable, PointHistoryTable],
  exports: [UserPointTable, PointHistoryTable],
})
export class DatabaseModule {}
