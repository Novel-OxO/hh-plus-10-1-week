import { ValidationExceptionFilter } from '@/filters/validation-exception.filter';
import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PointModule } from '@/modules/point.module';

describe('PointController (Concurrency)', () => {
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

  describe('동시성 제어', () => {
    it('동일 유저가 동시에 여러 번 충전해도 모든 충전이 정확히 반영된다', async () => {
      // given
      const userId = 100;
      const chargeAmount = 1000;
      const concurrentRequests = 5;

      // when: 동시에 5번 충전
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }),
      );

      await Promise.all(promises);

      // then: 최종 잔액 확인
      const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

      // 5번 * 1000원 = 5000원이 정확히 충전되어야 함
      expect(response.body.point).toBe(chargeAmount * concurrentRequests);
    });

    it('동일 유저가 동시에 여러 번 사용해도 모든 사용이 정확히 반영된다', async () => {
      // given
      const userId = 101;
      const initialCharge = 10000;
      const useAmount = 500;
      const concurrentRequests = 5;

      await request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: initialCharge }).expect(200);

      // when: 동시에 5번 사용 (각 사용시 1% 적립)
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }),
      );

      await Promise.all(promises);

      // then: 최종 잔액 확인
      const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

      // 10000 - (500 * 5) + (5 * 5) = 10000 - 2500 + 25 = 7525
      const expectedPoint = initialCharge - useAmount * concurrentRequests + useAmount * concurrentRequests * 0.01;
      expect(response.body.point).toBe(expectedPoint);
    });

    it('동일 유저가 동시에 충전과 사용을 해도 모든 거래가 정확히 반영된다', async () => {
      // given
      const userId = 102;
      const chargeAmount = 1000;
      const useAmount = 500;

      // when: 충전 3번, 사용 2번을 동시에 실행
      const promises = [
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/use`).send({ amount: useAmount }),
      ];

      await Promise.all(promises);

      // then: 최종 잔액 확인
      const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

      // (1000 * 3) - (500 * 2) + (500 * 2 * 0.01) = 3000 - 1000 + 10 = 2010
      expect(response.body.point).toBe(2010);
    });

    it('다른 유저들의 동시 충전은 서로 영향을 주지 않는다', async () => {
      // given
      const user1 = 103;
      const user2 = 104;
      const chargeAmount = 1000;

      // when: 두 유저가 동시에 충전
      await Promise.all([
        request(app.getHttpServer()).patch(`/point/${user1}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${user2}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${user1}/charge`).send({ amount: chargeAmount }),
        request(app.getHttpServer()).patch(`/point/${user2}/charge`).send({ amount: chargeAmount }),
      ]);

      // then: 각 유저의 잔액이 독립적으로 관리됨
      const response1 = await request(app.getHttpServer()).get(`/point/${user1}`).expect(200);
      const response2 = await request(app.getHttpServer()).get(`/point/${user2}`).expect(200);

      expect(response1.body.point).toBe(2000);
      expect(response2.body.point).toBe(2000);
    });

    it('동시 요청 중 일부가 실패해도 성공한 요청만 반영된다', async () => {
      // given
      const userId = 105;
      const validAmount = 1000;
      const invalidAmount = 150; // 100원 단위가 아님

      // when: 유효한 요청 3개, 무효한 요청 2개를 동시에 실행
      const promises = [
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: validAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: invalidAmount }), // 실패
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: validAmount }),
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: invalidAmount }), // 실패
        request(app.getHttpServer()).patch(`/point/${userId}/charge`).send({ amount: validAmount }),
      ];

      await Promise.allSettled(promises);

      // then: 유효한 요청만 반영됨
      const response = await request(app.getHttpServer()).get(`/point/${userId}`).expect(200);

      // 유효한 충전 3번 * 1000원 = 3000원
      expect(response.body.point).toBe(3000);
    });
  });
});
