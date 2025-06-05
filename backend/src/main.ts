import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 2. Add this line to enable global validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that are not defined in the DTO
      transform: true, // <-- This is the magic part! It transforms the incoming payload to match the DTO types
    }),
  );

  app.enableCors();
  await app.listen(7000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
