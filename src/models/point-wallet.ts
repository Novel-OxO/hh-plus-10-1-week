import { ValidationException } from '@/models/exception/validation.exception';
import { Point } from '@/models/point';

export class PointWallet {
  private static readonly MAX_BALANCE = new Point(2_000_000);

  constructor(
    readonly userId: number,
    private _balance: Point,
  ) {
    if (_balance.isNegative()) {
      throw new ValidationException('초기 잔액은 0원 이상이어야 합니다');
    }

    if (_balance.isGreaterThan(PointWallet.MAX_BALANCE)) {
      throw new ValidationException('잔액이 최대 한도를 초과할 수 없습니다');
    }
  }

  get balance(): Point {
    return this._balance;
  }

  deposit(amount: Point): void {
    if (!amount.isPositive()) {
      throw new ValidationException('입금 금액은 0보다 커야 합니다');
    }

    const newBalance = this._balance.add(amount);

    if (newBalance.isGreaterThan(PointWallet.MAX_BALANCE)) {
      throw new ValidationException('잔액이 최대 한도를 초과할 수 없습니다');
    }

    this._balance = newBalance;
  }

  withdraw(amount: Point): void {
    if (!amount.isPositive()) {
      throw new ValidationException('출금 금액은 0보다 커야 합니다');
    }

    const newBalance = this._balance.subtract(amount);

    if (newBalance.isNegative()) {
      throw new ValidationException('잔액이 부족합니다');
    }

    this._balance = newBalance;
  }
}
