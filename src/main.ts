import { ValidationExceptionFilter } from '@/filters/validation-exception.filter';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ValidationExceptionFilter());
  await app.listen(3000);
}
bootstrap();
