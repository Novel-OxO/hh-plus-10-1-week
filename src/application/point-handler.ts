import { Point } from '@/models/point/point';
import { PointWallet } from '@/models/point/point-wallet';
import { NoRewardPolicy } from '@/models/reward/no-reward-policy';
import { RewardPolicy } from '@/models/reward/reward-policy';

export type PointHandlerResult = {
  wallet: PointWallet;
  reward: Point | null;
};

export class PointHandler {
  charge(wallet: PointWallet, amount: Point, rewardPolicy: RewardPolicy = new NoRewardPolicy()): PointHandlerResult {
    wallet.deposit(amount);
    const reward = rewardPolicy.apply(amount);

    if (reward.isPositive()) {
      wallet.deposit(reward);
    }

    return {
      wallet,
      reward,
    };
  }

  use(wallet: PointWallet, amount: Point, rewardPolicy: RewardPolicy = new NoRewardPolicy()): PointHandlerResult {
    wallet.withdraw(amount);
    const reward = rewardPolicy.apply(amount);

    if (reward.isPositive()) {
      wallet.deposit(reward);
    }

    return {
      wallet,
      reward,
    };
  }
}
