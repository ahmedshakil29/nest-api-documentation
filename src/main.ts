import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Foodie API')
    .setDescription('API documentation using Scalar')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  await app.listen(3000);
  console.log('Server running at http://localhost:3000');
  console.log('Scalar docs at http://localhost:3000/docs');
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Swagger configuration
//   const config = new DocumentBuilder()
//     .setTitle('Foodie API') // API title
//     .setDescription('API documentation for NestJS + Bun project')
//     .setVersion('1.0')
//     .addBearerAuth() // for JWT auth
//     .build();

//   const document = SwaggerModule.createDocument(app, config);

//   // Serve Swagger UI at /api/v1
//   SwaggerModule.setup('api/v1', app, document);

//   await app.listen(3000);
//   console.log('Server running at http://localhost:3000');
//   console.log('Swagger docs at http://localhost:3000/api/v1');
// }
// bootstrap();
