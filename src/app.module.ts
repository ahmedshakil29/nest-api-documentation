// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [MongooseModule.forRoot('mongodb://localhost:27017/foodio')],
// })
// export class AppModule {}

import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const logger = new Logger('MongoDB');

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 10000, limit: 3 },
      { name: 'medium', ttl: 10, limit: 20 },
      { name: 'long', ttl: 60, limit: 100 },
    ]),

    // Async config to log after connection
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = 'mongodb://localhost:27017/foodio';
        const mongoose = await import('mongoose'); // dynamic import
        const connection = await mongoose.connect(uri);

        logger.log('✅ MongoDB connected successfully!');
        return { uri };
      },
    }),

    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from './users/users.module';

// @Module({
//   imports: [
//     ThrottlerModule.forRoot([
//       {
//         name: 'short',
//         ttl: 1000, // 1 second
//         limit: 3,
//       },
//       {
//         name: 'medium',
//         ttl: 10_000, // 10 seconds
//         limit: 20,
//       },
//       {
//         name: 'long',
//         ttl: 60_000, // 1 minute
//         limit: 100,
//       },
//     ]),
//     // MongoDB connection
//     MongooseModule.forRoot('mongodb://localhost:27017/foodio'),
//     UsersModule,
//   ],
//   providers: [
//     {
//       provide: APP_GUARD,
//       useClass: ThrottlerGuard, // global guard
//     },
//   ],
// })
// export class AppModule {}
