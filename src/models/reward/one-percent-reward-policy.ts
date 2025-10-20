import { Point } from '@/models/point/point';
import { RewardPolicy } from '@/models/reward/reward-policy';

export class OnePercentRewardPolicy implements RewardPolicy {
  private static readonly REWARD_RATE = 0.01;

  apply(usedPoint: Point): Point {
    return usedPoint.multiply(OnePercentRewardPolicy.REWARD_RATE);
  }
}
