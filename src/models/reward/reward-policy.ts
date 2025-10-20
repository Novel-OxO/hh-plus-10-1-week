import { Point } from '@/models/point/point';

export interface RewardPolicy {
  apply(usedPoint: Point): Point;
}
