import { Point } from '@/models/point/point';
import { RewardPolicy } from '@/models/reward/reward-policy';

export class NoRewardPolicy implements RewardPolicy {
  apply(): Point {
    return Point.ZERO;
  }
}
