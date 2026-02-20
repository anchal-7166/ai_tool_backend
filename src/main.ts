import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true, 
    transformOptions: {
      enableImplicitConversion: true,  
    },
  })
);

  const allowedOrigins = [
    'http://localhost:3001',           // Local development
    'http://localhost:3000',           // Alternative local port
    'https://staging.yourdomain.com',  // Staging
    'https://yourdomain.com',          // Production
    'https://www.yourdomain.com',      // Production www
  ];

   app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });



  const config = new DocumentBuilder()
    .setTitle('AI TOOLS SEARCH API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000,()=>{
      console.log("Swagger Docs ---> http://localhost:3000/api/docs")
      console.log("Bull MQ  ---> http://localhost:3000/admin/queues")
  });


}
bootstrap();