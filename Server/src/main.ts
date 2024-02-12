import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('./secrets/selfsigned.key'),
  cert: fs.readFileSync('./secrets/selfsigned.crt'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: '*' });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('UE API')
    .setDescription('...')
    .setVersion('1.0')
    .addTag('v1')
    .setContact(
      'UEBERBIT GmbH',
      'https://www.ueberbit.de/',
      'contact [at] ueberbit.de',
    )
    .addBearerAuth() // optional if any route has bearer authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/', app, document);

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
