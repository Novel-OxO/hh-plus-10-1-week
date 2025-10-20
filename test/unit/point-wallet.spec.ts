import { ValidationException } from '@/models/exception/validation.exception';
import { Point } from '@/models/point';
import { PointWallet } from '@/models/point-wallet';

describe('PointWallet', () => {
  describe('생성', () => {
    it('userId와 초기 잔액으로 지갑을 생성할 수 있다', () => {
      // given
      const userId = 1;
      const initialBalance = new Point(1000);

      // when
      const wallet = new PointWallet(userId, initialBalance);

      // then
      expect(wallet.userId).toBe(userId);
      expect(wallet.balance.amount).toBe(1000);
    });

    it('초기 잔액 0원으로 지갑을 생성할 수 있다', () => {
      // given
      const userId = 1;
      const initialBalance = Point.ZERO;

      // when
      const wallet = new PointWallet(userId, initialBalance);

      // then
      expect(wallet.balance.amount).toBe(0);
    });

    it('초기 잔액이 음수이면 예외가 발생한다', () => {
      // given
      const userId = 1;
      const initialBalance = new Point(-100);

      // when & then
      expect(() => new PointWallet(userId, initialBalance)).toThrow(ValidationException);
      expect(() => new PointWallet(userId, initialBalance)).toThrow('초기 잔액은 0원 이상이어야 합니다');
    });

    it('초기 잔액이 최대 한도를 초과하면 예외가 발생한다', () => {
      // given
      const userId = 1;
      const initialBalance = new Point(2_000_100);

      // when & then
      expect(() => new PointWallet(userId, initialBalance)).toThrow(ValidationException);
      expect(() => new PointWallet(userId, initialBalance)).toThrow('잔액이 최대 한도를 초과할 수 없습니다');
    });
  });

  describe('입금 (deposit)', () => {
    it('포인트를 입금할 수 있다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = new Point(500);

      // when
      wallet.deposit(amount);

      // then
      expect(wallet.balance.amount).toBe(1500);
    });

    it('입금 후 잔액이 최대 한도를 초과하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1_900_000));
      const amount = new Point(200_000);

      // when & then
      expect(() => wallet.deposit(amount)).toThrow(ValidationException);
      expect(() => wallet.deposit(amount)).toThrow('잔액이 최대 한도를 초과할 수 없습니다');
    });

    it('입금 후에도 기존 잔액은 유지된다 (실패 시)', () => {
      // given
      const wallet = new PointWallet(1, new Point(1_900_000));
      const amount = new Point(200_000);

      // when
      try {
        wallet.deposit(amount);
      } catch (e) {
        // 예외 발생 예상
      }

      // then
      expect(wallet.balance.amount).toBe(1_900_000);
    });

    it('음수 금액을 입금하려 하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = new Point(-100);

      // when & then
      expect(() => wallet.deposit(amount)).toThrow(ValidationException);
      expect(() => wallet.deposit(amount)).toThrow('입금 금액은 0보다 커야 합니다');
    });

    it('0원을 입금하려 하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = Point.ZERO;

      // when & then
      expect(() => wallet.deposit(amount)).toThrow(ValidationException);
      expect(() => wallet.deposit(amount)).toThrow('입금 금액은 0보다 커야 합니다');
    });
  });

  describe('출금 (withdraw)', () => {
    it('포인트를 출금할 수 있다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = new Point(300);

      // when
      wallet.withdraw(amount);

      // then
      expect(wallet.balance.amount).toBe(700);
    });

    it('잔액이 부족하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(500));
      const amount = new Point(1000);

      // when & then
      expect(() => wallet.withdraw(amount)).toThrow(ValidationException);
      expect(() => wallet.withdraw(amount)).toThrow('잔액이 부족합니다');
    });

    it('출금 후에도 기존 잔액은 유지된다 (실패 시)', () => {
      // given
      const wallet = new PointWallet(1, new Point(500));
      const amount = new Point(1000);

      // when
      try {
        wallet.withdraw(amount);
      } catch (e) {
        // 예외 발생 예상
      }

      // then
      expect(wallet.balance.amount).toBe(500);
    });

    it('음수 금액을 출금하려 하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = new Point(-100);

      // when & then
      expect(() => wallet.withdraw(amount)).toThrow(ValidationException);
      expect(() => wallet.withdraw(amount)).toThrow('출금 금액은 0보다 커야 합니다');
    });

    it('0원을 출금하려 하면 예외가 발생한다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = Point.ZERO;

      // when & then
      expect(() => wallet.withdraw(amount)).toThrow(ValidationException);
      expect(() => wallet.withdraw(amount)).toThrow('출금 금액은 0보다 커야 합니다');
    });

    it('전액 출금할 수 있다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1000));
      const amount = new Point(1000);

      // when
      wallet.withdraw(amount);

      // then
      expect(wallet.balance.amount).toBe(0);
    });
  });

  describe('잔액 조회', () => {
    it('현재 잔액을 조회할 수 있다', () => {
      // given
      const wallet = new PointWallet(1, new Point(1500));

      // when
      const balance = wallet.balance;

      // then
      expect(balance.amount).toBe(1500);
    });
  });
});
