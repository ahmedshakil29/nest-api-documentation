import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { UserTenantService } from '../user-tenant/user-tenant.service';
import { TenantStatus } from '../schemas/user-tenant.schema';
import { JwtPayload } from './types/jwt-payload.type';
import { LoginDto } from './dto/login.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_TTL = '15m';
  private readonly REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

  constructor(
    private readonly usersService: UsersService,
    private readonly userTenantService: UserTenantService,
    private readonly jwtService: JwtService,

    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  /**
   * STEP 1: Login → return tenants (NO token yet)
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenants = await this.userTenantService.getUserTenants(
      user._id.toString(),
    );

    return {
      userId: user._id,
      email: user.email,
      tenants,
    };
  }

  /**
   * STEP 2: Switch tenant → issue tokens
   */
  async switchTenant(dto: SwitchTenantDto) {
    const membership = await this.userTenantService.getMembership(
      dto.userId,
      dto.tenantId,
    );

    if (!membership || membership.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized tenant');
    }

    const accessPayload: JwtPayload = {
      sub: dto.userId,
      tenantId: dto.tenantId,
      role: membership.role,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.ACCESS_TTL,
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: dto.userId,
        tenantId: dto.tenantId,
        type: 'refresh',
      },
      {
        expiresIn: this.REFRESH_TTL,
      },
    );

    // Store refresh token in Redis
    await this.redis.set(
      `refresh_token:${dto.userId}:${dto.tenantId}`,
      refreshToken,
      'EX',
      this.REFRESH_TTL,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * STEP 3: Refresh access token
   */
  async refresh(userId: string, tenantId: string, refreshToken: string) {
    const storedToken = await this.redis.get(
      `refresh_token:${userId}:${tenantId}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const membership = await this.userTenantService.getMembership(
      userId,
      tenantId,
    );

    if (!membership || membership.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      sub: userId,
      tenantId,
      role: membership.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.ACCESS_TTL,
      }),
    };
  }

  /**
   * STEP 4: Logout (optional)
   */
  // async logout(userId: string, tenantId: string) {
  //   await this.redis.del(`refresh_token:${userId}:${tenantId}`);
  //   return { message: 'Logged out successfully' };
  // }
  async logout(userId: string) {
    const keys = await this.redis.keys(`refresh_token:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
    return { message: 'Logged out from all tenants successfully' };
  }
}

//--------------- tomorrow i will use it
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcryptjs';
// import { UsersService } from '../users/users.service';
// import { UserTenantService } from '../user-tenant/user-tenant.service';
// import { TenantStatus } from '../schemas/user-tenant.schema';
// import { JwtPayload } from './types/jwt-payload.type';
// import { RedisService } from '../redis/redis.service';
// import { LoginDto } from './dto/login.dto';
// import { SwitchTenantDto } from './dto/switch-tenant.dto';

// @Injectable()
// export class AuthService {
//   private ACCESS_TTL = '15m';
//   private REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

//   constructor(
//     private readonly usersService: UsersService,
//     private readonly userTenantService: UserTenantService,
//     private readonly jwtService: JwtService,
//     private readonly redisService: RedisService,
//   ) {}

//   /**
//    * STEP 1: Login (no token)
//    */
//   async login(dto: LoginDto) {
//     const user = await this.usersService.findByEmail(dto.email);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const valid = await bcrypt.compare(dto.password, user.password);
//     if (!valid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const tenants = await this.userTenantService.getUserTenants(
//       user._id.toString(),
//     );

//     return {
//       userId: user._id,
//       email: user.email,
//       tenants,
//     };
//   }

//   /**
//    * STEP 2: Switch tenant → issue tokens
//    */
//   async switchTenant(dto: SwitchTenantDto) {
//     const membership = await this.userTenantService.getMembership(
//       dto.userId,
//       dto.tenantId,
//     );

//     if (!membership || membership.status !== TenantStatus.ACTIVE) {
//       throw new UnauthorizedException('Unauthorized tenant');
//     }

//     const accessPayload: JwtPayload = {
//       sub: dto.userId,
//       tenantId: dto.tenantId,
//       role: membership.role,
//     };

//     const accessToken = this.jwtService.sign(accessPayload, {
//       expiresIn: this.ACCESS_TTL,
//     });

//     const refreshToken = this.jwtService.sign(
//       {
//         sub: dto.userId,
//         tenantId: dto.tenantId,
//         type: 'refresh',
//       },
//       {
//         expiresIn: this.REFRESH_TTL,
//       },
//     );

//     await this.redisService.set(
//       `refresh_token:${dto.userId}:${dto.tenantId}`,
//       refreshToken,
//       this.REFRESH_TTL,
//     );

//     return {
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * STEP 3: Refresh access token
//    */
//   async refresh(userId: string, tenantId: string, refreshToken: string) {
//     const stored = await this.redisService.get(
//       `refresh_token:${userId}:${tenantId}`,
//     );

//     if (!stored || stored !== refreshToken) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }

//     const membership = await this.userTenantService.getMembership(
//       userId,
//       tenantId,
//     );

//     if (!membership) {
//       throw new UnauthorizedException();
//     }

//     const payload: JwtPayload = {
//       sub: userId,
//       tenantId,
//       role: membership.role,
//     };

//     return {
//       accessToken: this.jwtService.sign(payload, {
//         expiresIn: this.ACCESS_TTL,
//       }),
//     };
//   }

//   /**
//    * Logout (optional)
//    */
//   async logout(userId: string, tenantId: string) {
//     await this.redisService.del(`refresh_token:${userId}:${tenantId}`);
//   }
// }

//**************   old         ******** */
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcryptjs';
// import { TenantStatus } from '../schemas/user-tenant.schema';
// import { UsersService } from '../users/users.service';
// import { UserTenantService } from '../user-tenant/user-tenant.service';
// import { LoginDto } from './dto/login.dto';
// import { SwitchTenantDto } from './dto/switch-tenant.dto';
// import { JwtPayload } from './types/jwt-payload.type';
// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly userTenantService: UserTenantService,
//     private readonly jwtService: JwtService,
//   ) {}

//   /**
//    * STEP 1
//    * Login user and return available tenants
//    */
//   async login(dto: LoginDto) {
//     const { email, password } = dto;

//     const user = await this.usersService.findByEmail(email);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const passwordValid = await bcrypt.compare(password, user.password);
//     if (!passwordValid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const tenants = await this.userTenantService.getUserTenants(
//       user._id.toString(),
//     );

//     return {
//       userId: user._id,
//       email: user.email,
//       tenants,
//     };
//   }

//   async switchTenant(dto: SwitchTenantDto) {
//     const { userId, tenantId } = dto;
//     const membership = await this.userTenantService.getMembership(
//       userId,
//       tenantId,
//     );

//     if (!membership || membership.status !== TenantStatus.ACTIVE) {
//       throw new UnauthorizedException('User does not belong to this tenant');
//     }

//     const payload: JwtPayload = {
//       sub: userId,
//       tenantId,
//       role: membership.role,
//     };

//     const accessToken = this.jwtService.sign(payload) as string;

//     return { accessToken };
//   }
// }
