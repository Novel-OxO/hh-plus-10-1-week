import { ValidationException } from '@/models/exception/validation.exception';

export class Point {
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
}
