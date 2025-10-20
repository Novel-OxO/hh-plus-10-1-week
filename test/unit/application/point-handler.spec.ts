import { PointHandler } from '@/application/point-handler';
import { ValidationException } from '@/models/exception/validation.exception';
import { Point } from '@/models/point/point';
import { PointWallet } from '@/models/point/point-wallet';
import { OnePercentRewardPolicy } from '@/models/reward/one-percent-reward-policy';

describe('PointHandler', () => {
  let handler: PointHandler;

  beforeEach(() => {
    handler = new PointHandler();
  });

  describe('charge', () => {
    it('기본 정책(NoRewardPolicy)으로 충전하면 적립금이 없다', () => {
      // given
      const wallet = new PointWallet(1, Point.ZERO);
      const chargeAmount = new Point(1000);

      // when
      const result = handler.charge(wallet, chargeAmount);

      // then
      expect(result.wallet.balance.amount).toBe(1000);
      expect(result.reward.amount).toBe(0);
    });

    it('OnePercentRewardPolicy로 충전하면 1% 적립된다', () => {
      // given
      const wallet = new PointWallet(1, Point.ZERO);
      const chargeAmount = new Point(10000);
      const rewardPolicy = new OnePercentRewardPolicy();

      // when
      const result = handler.charge(wallet, chargeAmount, rewardPolicy);

      // then
      expect(result.wallet.balance.amount).toBe(10100); // 10000 + 100 (1%)
      expect(result.reward.amount).toBe(100);
    });

    it('0원을 충전할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, Point.ZERO);

      // when & then
      expect(() => handler.charge(wallet, Point.ZERO)).toThrow(ValidationException);
    });

    it('음수 금액을 충전할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, Point.ZERO);
      const negativeAmount = new Point(-1000);

      // when & then
      expect(() => handler.charge(wallet, negativeAmount)).toThrow(ValidationException);
    });

    it('충전 후 잔액이 최대 한도를 초과할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1_900_000));
      const chargeAmount = new Point(200_000); // 합계 2,100,000원

      // when & then
      expect(() => handler.charge(wallet, chargeAmount)).toThrow(ValidationException);
    });

    it('적립 포인트를 포함하여 최대 한도를 초과할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1_990_000));
      const chargeAmount = new Point(10_000); // 10000 + 100 (1%) = 10100
      const rewardPolicy = new OnePercentRewardPolicy();

      // when & then
      expect(() => handler.charge(wallet, chargeAmount, rewardPolicy)).toThrow(ValidationException);
    });
  });

  describe('use', () => {
    it('기본 정책(NoRewardPolicy)으로 사용하면 적립금이 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(10000));
      const useAmount = new Point(1000);

      // when
      const result = handler.use(wallet, useAmount);

      // then
      expect(result.wallet.balance.amount).toBe(9000);
      expect(result.reward.amount).toBe(0);
    });

    it('OnePercentRewardPolicy로 사용하면 1% 적립된다', () => {
      // given
      const wallet = new PointWallet(1, new Point(100000));
      const useAmount = new Point(50000);
      const rewardPolicy = new OnePercentRewardPolicy();

      // when
      const result = handler.use(wallet, useAmount, rewardPolicy);

      // then
      expect(result.wallet.balance.amount).toBe(50500); // 100000 - 50000 + 500 (1%)
      expect(result.reward.amount).toBe(500);
    });

    it('0원을 사용할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(10000));

      // when & then
      expect(() => handler.use(wallet, Point.ZERO)).toThrow(ValidationException);
    });

    it('음수 금액을 사용할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(10000));
      const negativeAmount = new Point(-1000);

      // when & then
      expect(() => handler.use(wallet, negativeAmount)).toThrow(ValidationException);
    });

    it('잔액이 부족하면 사용할 수 없다', () => {
      // given
      const wallet = new PointWallet(1, new Point(500));
      const useAmount = new Point(1000);

      // when & then
      expect(() => handler.use(wallet, useAmount)).toThrow(ValidationException);
    });
  });
});
