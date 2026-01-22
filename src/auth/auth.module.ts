// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { UsersModule } from '../users/users.module';
import { UserTenantModule } from '../user-tenant/user-tenant.module';
import { TenantsModule } from '../tenants/tenants.module'; // ✅ ADD
import { RolesModule } from '../roles/roles.module'; // ✅ ADD

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    UsersModule,
    UserTenantModule,
    TenantsModule, // ✅ REQUIRED
    RolesModule, // ✅ REQUIRED

    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { JwtStrategy } from './jwt.strategy';
// import { UsersModule } from '../users/users.module';
// import { UserTenantModule } from '../user-tenant/user-tenant.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }), // loads .env globally
//     UsersModule,
//     UserTenantModule,
//     PassportModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { JwtStrategy } from './jwt.strategy';
// import { UsersModule } from '../users/users.module';
// import { UserTenantModule } from '../user-tenant/user-tenant.module';

// @Module({
//   imports: [
//     UsersModule,
//     UserTenantModule,
//     PassportModule,
//     JwtModule.register({
//       secret: 'super-secret-key', // use env variable in prod
//       signOptions: { expiresIn: '1h' },
//     }),
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}
