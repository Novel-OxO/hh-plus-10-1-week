import { Point } from '@/models/point/point';
import { OnePercentRewardPolicy } from '@/models/reward/one-percent-reward-policy';

describe('OnePercentRewardPolicy', () => {
  let policy: OnePercentRewardPolicy;

  beforeEach(() => {
    policy = new OnePercentRewardPolicy();
  });

  describe('apply', () => {
    it('사용 금액의 1%를 적립 포인트로 반환한다', () => {
      // given
      const usedPoint = new Point(10000);

      // when
      const reward = policy.apply(usedPoint);

      // then
      expect(reward.amount).toBe(100); // 10000 * 0.01 = 100
    });

    it('소수점은 내림 처리된다', () => {
      // given
      const usedPoint = new Point(1550);

      // when
      const reward = policy.apply(usedPoint);

      // then
      expect(reward.amount).toBe(15); // 1550 * 0.01 = 15.5 -> 15
    });

    it.each([
      { used: 10000, expected: 100, description: '10,000원 사용 시 100원 적립' },
      { used: 50000, expected: 500, description: '50,000원 사용 시 500원 적립' },
      { used: 100000, expected: 1000, description: '100,000원 사용 시 1,000원 적립' },
      { used: 5000, expected: 50, description: '5,000원 사용 시 50원 적립' },
      { used: 25000, expected: 250, description: '25,000원 사용 시 250원 적립' },
      { used: 1550, expected: 15, description: '1,550원 사용 시 15원 적립 (15.5 -> 15)' },
    ])('$description', ({ used, expected }) => {
      const usedPoint = new Point(used);
      const reward = policy.apply(usedPoint);
      expect(reward.amount).toBe(expected);
    });

    it('0원 사용 시 0원 적립', () => {
      // given
      const usedPoint = Point.ZERO;

      // when
      const reward = policy.apply(usedPoint);

      // then
      expect(reward.amount).toBe(0);
    });
  });
});
