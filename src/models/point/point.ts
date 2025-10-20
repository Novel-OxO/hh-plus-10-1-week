import { ValidationException } from '@/models/exception/validation.exception';

export class Point {
  static readonly ZERO = new Point(0);

  constructor(readonly amount: number) {
    if (!Number.isInteger(amount)) {
      throw new ValidationException('포인트는 정수만 가능합니다');
    }

    if (!Number.isSafeInteger(amount)) {
      throw new ValidationException('포인트 금액이 안전한 정수 범위를 벗어났습니다');
    }
  }

  add(other: Point): Point {
    return new Point(this.amount + other.amount);
  }

  subtract(other: Point): Point {
    return new Point(this.amount - other.amount);
  }

  multiply(rate: number): Point {
    const result = this.amount * rate;
    return new Point(Math.floor(result));
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isGreaterThan(other: Point): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Point): boolean {
    return this.amount < other.amount;
  }

  isGreaterThanOrEqual(other: Point): boolean {
    return this.amount >= other.amount;
  }

  isLessThanOrEqual(other: Point): boolean {
    return this.amount <= other.amount;
  }
}
