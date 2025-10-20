export class Point {
  constructor(readonly amount: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  add(_other: Point): Point {
    return new Point(0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subtract(_other: Point): Point {
    return new Point(0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  multiply(_rate: number): Point {
    return new Point(0);
  }
}
