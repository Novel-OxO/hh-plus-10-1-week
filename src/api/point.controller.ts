import { Body, Controller, Get, Param, Patch, ValidationPipe } from '@nestjs/common';

import { PointService } from '@/application/point.service';
import { PointBody as PointDto } from '@/models/point.dto';
import { PointHistory, UserPoint } from '@/models/point.model';
import { Point } from '@/models/point/point';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    return { id: userId, point: 0, updateMillis: Date.now() };
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id): Promise<PointHistory[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = Number.parseInt(id);
    return [];
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(@Param('id') id, @Body(ValidationPipe) pointDto: PointDto): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    const amount = new Point(pointDto.amount);
    return this.pointService.charge(userId, amount);
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(@Param('id') id, @Body(ValidationPipe) pointDto: PointDto): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;
    return { id: userId, point: amount, updateMillis: Date.now() };
  }
}
