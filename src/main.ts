import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import { ensureUploadsFolder } from 'utils/methods';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  ensureUploadsFolder();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // 👈 Add this
  // app.enableCors({
  //   origin: 'http://localhost:3000', // frontend
  //   credentials: true, // allow sending cookies
  // });
  app.enableCors({
    origin: true, // ✅ Allow all origins dynamically
    credentials: true, // ✅ Allow cookies to be sent
  });

  // 🟢 Regular body parser for other routes
  app.use(json());
  app.use(urlencoded({ extended: true }));

  await app.listen(3014);
}
bootstrap();
