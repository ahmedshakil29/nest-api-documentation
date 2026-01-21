import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UserTenantModule } from '../user-tenant/user-tenant.module';

@Module({
  imports: [
    UsersModule,
    UserTenantModule,
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret_here', // use env variable in prod
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
