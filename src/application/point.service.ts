import { Injectable } from '@nestjs/common';

import { PointHandler } from '@/application/point-handler';
import { PointHistoryTable } from '@/database/pointhistory.table';
import { UserPointTable } from '@/database/userpoint.table';
import { ValidationException } from '@/models/exception/validation.exception';
import { TransactionType, UserPoint } from '@/models/point.model';
import { Point } from '@/models/point/point';
import { PointWallet } from '@/models/point/point-wallet';
import { RewardPolicy } from '@/models/reward/reward-policy';

@Injectable()
export class PointService {
  constructor(
    private readonly userPointTable: UserPointTable,
    private readonly historyTable: PointHistoryTable,
    private readonly pointHandler: PointHandler,
  ) {}

  /**
   * 포인트 충전
   * @param userId 사용자 ID
   * @param amount 충전 금액
   * @param rewardPolicy 보상 정책 (기본: OnePercentRewardPolicy)
   * @returns 충전 후 사용자 포인트 정보
   */
  async charge(userId: number, amount: Point, rewardPolicy?: RewardPolicy): Promise<UserPoint> {
    // 100원 단위 검증
    if (amount.amount % 100 !== 0) {
      throw new ValidationException('100원 단위로만 충전할 수 있습니다');
    }

    const currentUserPoint = await this.userPointTable.selectById(userId);

    const wallet = new PointWallet(userId, new Point(currentUserPoint.point));
    const result = this.pointHandler.charge(wallet, amount, rewardPolicy);

    const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, result.wallet.balance.amount);

    await this.historyTable.insert(userId, amount.amount, TransactionType.CHARGE, updatedUserPoint.updateMillis);

    return updatedUserPoint;
  }
}
