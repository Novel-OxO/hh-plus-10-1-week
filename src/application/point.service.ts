import { Mutex } from 'async-mutex';

import { Injectable } from '@nestjs/common';

import { PointHandler } from '@/application/point-handler';
import { PointHistoryTable } from '@/database/pointhistory.table';
import { UserPointTable } from '@/database/userpoint.table';
import { ValidationException } from '@/models/exception/validation.exception';
import { PointHistory, TransactionType, UserPoint } from '@/models/point.model';
import { Point } from '@/models/point/point';
import { PointWallet } from '@/models/point/point-wallet';
import { OnePercentRewardPolicy } from '@/models/reward/one-percent-reward-policy';
import { RewardPolicy } from '@/models/reward/reward-policy';

@Injectable()
export class PointService {
  private readonly userMutexes: Map<number, Mutex> = new Map();

  constructor(
    private readonly userPointTable: UserPointTable,
    private readonly historyTable: PointHistoryTable,
    private readonly pointHandler: PointHandler,
  ) {}

  private getUserMutex(userId: number): Mutex {
    if (!this.userMutexes.has(userId)) {
      this.userMutexes.set(userId, new Mutex());
    }
    return this.userMutexes.get(userId)!;
  }

  /**
   * 포인트 충전
   * @param userId 사용자 ID
   * @param amount 충전 금액
   * @param rewardPolicy 보상 정책 (기본: NoRewardPolicy)
   * @returns 충전 후 사용자 포인트 정보
   */
  async charge(userId: number, amount: Point, rewardPolicy?: RewardPolicy): Promise<UserPoint> {
    // 100원 단위 검증
    if (amount.amount % 100 !== 0) {
      throw new ValidationException('100원 단위로만 충전할 수 있습니다');
    }

    const mutex = this.getUserMutex(userId);
    return await mutex.runExclusive(async () => {
      const currentUserPoint = await this.userPointTable.selectById(userId);

      const wallet = new PointWallet(userId, new Point(currentUserPoint.point));
      const result = this.pointHandler.charge(wallet, amount, rewardPolicy);

      const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, result.wallet.balance.amount);

      await this.historyTable.insert(userId, amount.amount, TransactionType.CHARGE, updatedUserPoint.updateMillis);

      return updatedUserPoint;
    });
  }

  /**
   * 포인트 조회
   * @param userId 사용자 ID
   * @returns 사용자 포인트 정보
   */
  async getPoint(userId: number): Promise<UserPoint> {
    return this.userPointTable.selectById(userId);
  }

  /**
   * 포인트 사용
   * @param userId 사용자 ID
   * @param amount 사용 금액
   * @param rewardPolicy 보상 정책 (기본: OnePercentRewardPolicy)
   * @returns 사용 후 사용자 포인트 정보
   */
  async use(userId: number, amount: Point, rewardPolicy?: RewardPolicy): Promise<UserPoint> {
    // 100원 단위 검증
    if (amount.amount % 100 !== 0) {
      throw new ValidationException('100원 단위로만 사용할 수 있습니다');
    }

    const mutex = this.getUserMutex(userId);
    return await mutex.runExclusive(async () => {
      const currentUserPoint = await this.userPointTable.selectById(userId);

      const wallet = new PointWallet(userId, new Point(currentUserPoint.point));
      const result = this.pointHandler.use(wallet, amount, rewardPolicy || new OnePercentRewardPolicy());

      const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, result.wallet.balance.amount);

      await this.historyTable.insert(userId, amount.amount, TransactionType.USE, updatedUserPoint.updateMillis);

      // 보상이 있다면 보상 히스토리도 저장
      if (result.reward.isPositive()) {
        await this.historyTable.insert(
          userId,
          result.reward.amount,
          TransactionType.REWARD,
          updatedUserPoint.updateMillis,
        );
      }

      return updatedUserPoint;
    });
  }

  /**
   * 포인트 히스토리 조회
   * @param userId 사용자 ID
   * @returns 포인트 히스토리 목록
   */
  async getHistories(userId: number): Promise<PointHistory[]> {
    return this.historyTable.selectAllByUserId(userId);
  }
}
