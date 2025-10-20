import { ValidationExceptionFilter } from '@/filters/validation-exception.filter';
import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PointModule } from '@/modules/point.module';

describe('PointController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PointModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ValidationExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /point/:id', () => {
    describe('성공 케이스', () => {
      it('특정 유저의 포인트를 조회할 수 있다', async () => {
        // given
        const userId = 1;

        // when
        const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

        // then
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('point');
        expect(response.body).toHaveProperty('updateMillis');
        expect(typeof response.body.point).toBe('number');
        expect(response.body.point).toBeGreaterThanOrEqual(0);
      });

      it('포인트를 충전한 후 조회하면 충전된 포인트를 확인할 수 있다', async () => {
        // given
        const userId = 2;
        const chargeAmount = 1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

        // then
        expect(response.body.id).toBe(userId);
        expect(response.body.point).toBeGreaterThanOrEqual(chargeAmount);
      });

      it('충전하지 않은 유저의 포인트는 0이다', async () => {
        // given
        const userId = 999;

        // when
        const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

        // then
        expect(response.body.id).toBe(userId);
        expect(response.body.point).toBe(0);
      });
    });
  });

  describe('PATCH /point/:id/charge', () => {
    describe('성공 케이스', () => {
      it('포인트를 충전할 수 있다', async () => {
        // given
        const userId = 1;
        const chargeAmount = 1000;

        // when
        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/charge`)
          .send({ amount: chargeAmount })
          .expect(200);

        // then
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('point');
        expect(response.body).toHaveProperty('updateMillis');
      });

      it('100원 단위로 충전할 수 있다', async () => {
        // given
        const userId = 1;
        const chargeAmount = 500;

        // when
        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/charge`)
          .send({ amount: chargeAmount })
          .expect(200);

        // then
        expect(response.body.point).toBeGreaterThanOrEqual(0);
      });

      it('여러 번 충전하면 잔액이 누적된다', async () => {
        // given
        const userId = 1;
        const firstCharge = 1000;
        const secondCharge = 500;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: firstCharge }).expect(200);

        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/charge`)
          .send({ amount: secondCharge })
          .expect(200);

        // then
        // TODO: 실제 구현 후 정확한 잔액 검증 필요
        expect(response.body).toHaveProperty('point');
      });
    });

    describe('실패 케이스', () => {
      it('100원 단위가 아니면 충전할 수 없다', async () => {
        // given
        const userId = 1;
        const invalidAmount = 150; // 100원 단위가 아님

        // when & then
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: invalidAmount }).expect(400);
      });

      it('음수 금액으로 충전할 수 없다', async () => {
        // given
        const userId = 1;
        const negativeAmount = -1000;

        // when & then
        await request(app.getHttpServer())
          .patch(`/point/${userId}/charge`)
          .send({ amount: negativeAmount })
          .expect(400);
      });

      it('0원을 충전할 수 없다', async () => {
        // given
        const userId = 1;
        const zeroAmount = 0;

        // when & then
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: zeroAmount }).expect(400);
      });

      it('최대 잔액(2,000,000원)을 초과하여 충전할 수 없다', async () => {
        // given
        const userId = 1;
        const maxExceedAmount = 2_000_100; // 최대 한도 초과

        // when & then
        await request(app.getHttpServer())
          .patch(`/point/${userId}/charge`)
          .send({ amount: maxExceedAmount })
          .expect(400);
      });

      it('충전 후 잔액이 최대 한도(2,000,000원)를 초과할 수 없다', async () => {
        // given
        const userId = 1;
        const firstCharge = 1_900_000;
        const secondCharge = 200_000; // 합계 2,100,000원 (한도 초과)

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: firstCharge }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: secondCharge }).expect(400);
      });

      it('충전 금액이 누락되면 충전할 수 없다', async () => {
        // given
        const userId = 1;

        // when & then
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({}).expect(400);
      });

      it('충전 금액이 숫자가 아니면 충전할 수 없다', async () => {
        // given
        const userId = 1;

        // when & then
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: 'invalid' }).expect(400);
      });
    });
  });

  describe('PATCH /point/:id/use', () => {
    describe('성공 케이스', () => {
      it('포인트를 사용할 수 있다', async () => {
        // given
        const userId = 3;
        const chargeAmount = 10000;
        const useAmount = 1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/use`)
          .send({ amount: useAmount })
          .expect(200);

        // then
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('point');
        expect(response.body).toHaveProperty('updateMillis');
        expect(response.body.point).toBeLessThan(chargeAmount);
      });

      it('100원 단위로 사용할 수 있다', async () => {
        // given
        const userId = 4;
        const chargeAmount = 10000;
        const useAmount = 500;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/use`)
          .send({ amount: useAmount })
          .expect(200);

        // then
        expect(response.body.point).toBeGreaterThanOrEqual(0);
      });

      it('여러 번 사용하면 잔액이 차감된다', async () => {
        // given
        const userId = 5;
        const chargeAmount = 10000;
        const firstUse = 1000;
        const secondUse = 500;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: firstUse }).expect(200);

        const response = await request(app.getHttpServer())
          .patch(`/point/${userId}/use`)
          .send({ amount: secondUse })
          .expect(200);

        // then
        expect(response.body).toHaveProperty('point');
        expect(response.body.point).toBeLessThan(chargeAmount);
      });
    });

    describe('실패 케이스', () => {
      it('100원 단위가 아니면 사용할 수 없다', async () => {
        // given
        const userId = 6;
        const chargeAmount = 10000;
        const invalidAmount = 150; // 100원 단위가 아님

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: invalidAmount }).expect(400);
      });

      it('음수 금액으로 사용할 수 없다', async () => {
        // given
        const userId = 7;
        const chargeAmount = 10000;
        const negativeAmount = -1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: negativeAmount }).expect(400);
      });

      it('0원을 사용할 수 없다', async () => {
        // given
        const userId = 8;
        const chargeAmount = 10000;
        const zeroAmount = 0;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: zeroAmount }).expect(400);
      });

      it('잔액이 부족하면 사용할 수 없다', async () => {
        // given
        const userId = 9;
        const chargeAmount = 500;
        const useAmount = 1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }).expect(400);
      });

      it('사용 금액이 누락되면 사용할 수 없다', async () => {
        // given
        const userId = 10;
        const chargeAmount = 10000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({}).expect(400);
      });

      it('사용 금액이 숫자가 아니면 사용할 수 없다', async () => {
        // given
        const userId = 11;
        const chargeAmount = 10000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        // then
        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: 'invalid' }).expect(400);
      });
    });
  });

  describe('GET /point/:id/histories', () => {
    describe('성공 케이스', () => {
      it('특정 유저의 포인트 히스토리를 조회할 수 있다', async () => {
        // given
        const userId = 12;

        // when
        const response = await request(app.getHttpServer()).get(`/point/${userId}/histories`).expect(200);

        // then
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('충전 후 히스토리를 조회하면 충전 기록이 있다', async () => {
        // given
        const userId = 13;
        const chargeAmount = 1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        const response = await request(app.getHttpServer()).get(`/point/${userId}/histories`).expect(200);

        // then
        expect(response.body.length).toBeGreaterThan(0);
        const chargeHistory = response.body.find((h) => h.type === 0); // TransactionType.CHARGE = 0
        expect(chargeHistory).toBeDefined();
        expect(chargeHistory.amount).toBe(chargeAmount);
      });

      it('사용 후 히스토리를 조회하면 사용 기록과 보상 기록이 있다', async () => {
        // given
        const userId = 14;
        const chargeAmount = 10000;
        const useAmount = 1000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }).expect(200);

        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }).expect(200);

        const response = await request(app.getHttpServer()).get(`/point/${userId}/histories`).expect(200);

        // then
        expect(response.body.length).toBeGreaterThan(0);
        const useHistory = response.body.find((h) => h.type === 1); // TransactionType.USE = 1
        expect(useHistory).toBeDefined();
        expect(useHistory.amount).toBe(useAmount);

        const rewardHistory = response.body.find((h) => h.type === 2); // TransactionType.REWARD = 2
        expect(rewardHistory).toBeDefined();
        expect(rewardHistory.amount).toBe(10); // 1000 * 0.01 = 10
      });

      it('여러 번 충전/사용하면 모든 히스토리가 기록된다', async () => {
        // given
        const userId = 15;
        const firstCharge = 5000;
        const secondCharge = 3000;
        const useAmount = 2000;

        // when
        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: firstCharge }).expect(200);

        await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: secondCharge }).expect(200);

        await request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }).expect(200);

        const response = await request(app.getHttpServer()).get(`/point/${userId}/histories`).expect(200);

        // then
        expect(response.body.length).toBeGreaterThanOrEqual(3); // 최소 충전 2번 + 사용 1번
      });

      it('히스토리가 없는 유저는 빈 배열을 반환한다', async () => {
        // given
        const userId = 999;

        // when
        const response = await request(app.getHttpServer()).get(`/point/${userId}/histories`).expect(200);

        // then
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });
  });
});
