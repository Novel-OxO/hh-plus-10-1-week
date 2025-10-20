import { Point } from '@/models/point/point';
import { RewardPolicy } from '@/models/reward/reward-policy';

export class OnePercentRewardPolicy implements RewardPolicy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_usedPoint: Point): Point {
    return Point.ZERO;
  }
}
