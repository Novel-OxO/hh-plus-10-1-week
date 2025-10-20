import { ValidationException } from '@/models/exception/validation.exception';
import { Point } from '@/models/point';

describe('Point', () => {
  describe('생성', () => {
    it('양수 금액으로 Point를 생성할 수 있다', () => {
      // given
      const amount = 1000;

      // when
      const point = new Point(amount);

      // then
      expect(point.amount).toBe(1000);
    });

    it('0원으로 Point를 생성할 수 있다', () => {
      // given
      const amount = 0;

      // when
      const point = new Point(amount);

      // then
      expect(point.amount).toBe(0);
    });

    it('음수 금액으로 Point를 생성할 수 있다', () => {
      // given
      const amount = -100;

      // when
      const point = new Point(amount);

      // then
      expect(point.amount).toBe(-100);
    });

    it('실수로 생성 시 예외가 발생한다', () => {
      // given
      const amount = 100.5;

      // when & then
      expect(() => new Point(amount)).toThrow(ValidationException);
      expect(() => new Point(amount)).toThrow('포인트는 정수만 가능합니다');
    });

    it('Number의 안전한 정수 범위를 벗어나면 예외가 발생한다', () => {
      // given
      const amount = Number.MAX_SAFE_INTEGER + 1;

      // when & then
      expect(() => new Point(amount)).toThrow(ValidationException);
      expect(() => new Point(amount)).toThrow('포인트 금액이 안전한 정수 범위를 벗어났습니다');
    });
  });

  describe('덧셈', () => {
    it('두 Point를 더할 수 있다', () => {
      // given
      const point1 = new Point(1000);
      const point2 = new Point(500);

      // when
      const result = point1.add(point2);

      // then
      expect(result.amount).toBe(1500);
    });
  });

  describe('뺄셈', () => {
    it('두 Point를 뺄 수 있다', () => {
      // given
      const point1 = new Point(1000);
      const point2 = new Point(300);

      // when
      const result = point1.subtract(point2);

      // then
      expect(result.amount).toBe(700);
    });
  });

  describe('곱셈', () => {
    it('Point에 배율을 곱할 수 있다', () => {
      // given
      const point = new Point(1000);
      const multiplier = 2;

      // when
      const result = point.multiply(multiplier);

      // then
      expect(result.amount).toBe(2000);
    });

    it('1% 적립 계산을 할 수 있다', () => {
      // given
      const point = new Point(10000);
      const rate = 0.01;

      // when
      const result = point.multiply(rate);

      // then
      expect(result.amount).toBe(100); // 10000 * 0.01 = 100
    });

    it('곱셈 결과가 정수가 아니면 내림 처리된다', () => {
      // given
      const point = new Point(1500);
      const rate = 0.01;

      // when
      const result = point.multiply(rate);

      // then
      expect(result.amount).toBe(15); // 1500 * 0.01 = 15
    });
  });

  describe('비교', () => {
    describe('isNegative', () => {
      it.each([
        { amount: -100, expected: true, description: '음수' },
        { amount: 0, expected: false, description: '0' },
        { amount: 100, expected: false, description: '양수' },
      ])('$description이면 $expected를 반환한다', ({ amount, expected }) => {
        const point = new Point(amount);
        expect(point.isNegative()).toBe(expected);
      });
    });

    describe('isPositive', () => {
      it.each([
        { amount: 100, expected: true, description: '양수' },
        { amount: 0, expected: false, description: '0' },
        { amount: -100, expected: false, description: '음수' },
      ])('$description이면 $expected를 반환한다', ({ amount, expected }) => {
        const point = new Point(amount);
        expect(point.isPositive()).toBe(expected);
      });
    });

    describe('isZero', () => {
      it.each([
        { amount: 0, expected: true, description: '0' },
        { amount: 100, expected: false, description: '양수' },
        { amount: -100, expected: false, description: '음수' },
      ])('$description이면 $expected를 반환한다', ({ amount, expected }) => {
        const point = new Point(amount);
        expect(point.isZero()).toBe(expected);
      });
    });

    describe('isGreaterThan', () => {
      it.each([
        { amount1: 1000, amount2: 500, expected: true, description: '다른 Point보다 크면' },
        { amount1: 1000, amount2: 1000, expected: false, description: '다른 Point와 같으면' },
        { amount1: 500, amount2: 1000, expected: false, description: '다른 Point보다 작으면' },
      ])('$description $expected를 반환한다', ({ amount1, amount2, expected }) => {
        const point1 = new Point(amount1);
        const point2 = new Point(amount2);
        expect(point1.isGreaterThan(point2)).toBe(expected);
      });
    });

    describe('isLessThan', () => {
      it.each([
        { amount1: 500, amount2: 1000, expected: true, description: '다른 Point보다 작으면' },
        { amount1: 1000, amount2: 1000, expected: false, description: '다른 Point와 같으면' },
        { amount1: 1000, amount2: 500, expected: false, description: '다른 Point보다 크면' },
      ])('$description $expected를 반환한다', ({ amount1, amount2, expected }) => {
        const point1 = new Point(amount1);
        const point2 = new Point(amount2);
        expect(point1.isLessThan(point2)).toBe(expected);
      });
    });

    describe('isGreaterThanOrEqual', () => {
      it.each([
        { amount1: 1000, amount2: 500, expected: true, description: '다른 Point보다 크면' },
        { amount1: 1000, amount2: 1000, expected: true, description: '다른 Point와 같으면' },
        { amount1: 500, amount2: 1000, expected: false, description: '다른 Point보다 작으면' },
      ])('$description $expected를 반환한다', ({ amount1, amount2, expected }) => {
        const point1 = new Point(amount1);
        const point2 = new Point(amount2);
        expect(point1.isGreaterThanOrEqual(point2)).toBe(expected);
      });
    });

    describe('isLessThanOrEqual', () => {
      it.each([
        { amount1: 500, amount2: 1000, expected: true, description: '다른 Point보다 작으면' },
        { amount1: 1000, amount2: 1000, expected: true, description: '다른 Point와 같으면' },
        { amount1: 1000, amount2: 500, expected: false, description: '다른 Point보다 크면' },
      ])('$description $expected를 반환한다', ({ amount1, amount2, expected }) => {
        const point1 = new Point(amount1);
        const point2 = new Point(amount2);
        expect(point1.isLessThanOrEqual(point2)).toBe(expected);
      });
    });
  });
});
