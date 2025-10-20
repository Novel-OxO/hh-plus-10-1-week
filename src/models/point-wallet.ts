import { Point } from '@/models/point';

export class PointWallet {
  private static readonly MAX_BALANCE = 2_000_000;

  constructor(
    readonly userId: number,
    private _balance: Point,
  ) {}

  get balance(): Point {
    return this._balance;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deposit(_amount: Point): void {
    // TODO: implement
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withdraw(_amount: Point): void {
    // TODO: implement
  }
}
