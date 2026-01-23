// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { UserTenantService } from '../user-tenant/user-tenant.service';
import { TenantsService } from '../tenants/tenants.service';
import { RolesService } from '../roles/roles.service';

import { JwtPayload } from './types/jwt-payload.type';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_TTL = '1h';
  private readonly REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

  constructor(
    private readonly usersService: UsersService,
    private readonly userTenantService: UserTenantService,
    private readonly tenantsService: TenantsService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * ========================
   * SIGNUP
   * ========================
   */
  async signup(dto: SignupDto) {
    // 1️⃣ Email uniqueness
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2️⃣ Hash password
    // const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3️⃣ Create user
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    let tenant = null;

    // 4️⃣ Optional tenant creation
    if (dto.tenantName && dto.tenantDomain) {
      const existingTenant = await this.tenantsService.findByDomain(
        dto.tenantDomain,
      );
      if (existingTenant) {
        throw new BadRequestException('Tenant domain already exists');
      }

      // Create tenant
      tenant = await this.tenantsService.create({
        name: dto.tenantName,
        domain: dto.tenantDomain,
      });

      // Fetch OWNER role
      const ownerRole = await this.rolesService.findByName('SUPERADMIN');
      if (!ownerRole) {
        throw new BadRequestException('OWNER role not configured');
      }

      // Create user-tenant mapping
      await this.userTenantService.assignUser({
        userId: user._id,
        tenantId: tenant._id,
        roleId: ownerRole._id,
      });
    }

    return {
      message: 'Signup successful. Please login.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      tenant: tenant
        ? {
            id: tenant._id,
            name: tenant.name,
            domain: tenant.domain,
          }
        : null,
    };
  }

  /**
   * ========================
   * LOGIN
   * ========================
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) throw new UnauthorizedException('Invalid credentials');

    // Fetch tenants
    const tenants = await this.userTenantService.getUserTenants(
      user._id.toString(),
    );

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TTL,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString(), type: 'refresh' },
      { expiresIn: this.REFRESH_TTL },
    );

    await this.redis.set(
      `refresh_token:${user._id.toString()}`,
      refreshToken,
      'EX',
      this.REFRESH_TTL,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      tenants: tenants.map((t) => ({
        tenantId: t.tenantId._id.toString(),
        tenantName: t.tenantId.name,
        role: t.roleId.name || null,
        status: t.status,
      })),
      defaultTenant: tenants[0]?.tenantId._id.toString() || null,
    };
  }

  /**
   * ========================
   * REFRESH TOKEN
   * ========================
   */
  async refresh(userId: string, refreshToken: string) {
    const storedToken = await this.redis.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.ACCESS_TTL,
      }),
    };
  }

  /**
   * ========================
   * LOGOUT
   * ========================
   */
  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: 'Logged out successfully' };
  }
}

// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRedis } from '@nestjs-modules/ioredis';
// import Redis from 'ioredis';
// import * as bcrypt from 'bcryptjs';

// import { UsersService } from '../users/users.service';
// import { UserTenantService } from '../user-tenant/user-tenant.service';
// // import { TenantStatus } from '../schemas/user-tenant.schema';
// import { JwtPayload } from './types/jwt-payload.type';
// import { LoginDto } from './dto/login.dto';
// // import { SwitchTenantDto } from './dto/switch-tenant.dto';
// @Injectable()
// export class AuthService {
//   private readonly ACCESS_TTL = '1h'; // user-level token
//   private readonly REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

//   constructor(
//     private readonly usersService: UsersService,
//     private readonly userTenantService: UserTenantService,
//     private readonly jwtService: JwtService,
//     @InjectRedis() private readonly redis: Redis,
//   ) {}

//   async login(dto: LoginDto) {
//     const user = await this.usersService.findByEmail(dto.email);
//     if (!user) throw new UnauthorizedException('Invalid credentials');

//     const validPassword = await bcrypt.compare(dto.password, user.password);
//     if (!validPassword) throw new UnauthorizedException('Invalid credentials');

//     // Fetch all tenants for user
//     const tenants = await this.userTenantService.getUserTenants(
//       user._id.toString(),
//     );

//     // JWT payload WITHOUT tenantId
//     const payload: JwtPayload = {
//       sub: user._id.toString(),
//       email: user.email,
//       name: user.name,
//     };

//     const accessToken = this.jwtService.sign(payload, {
//       expiresIn: this.ACCESS_TTL,
//     });

//     // Optionally, store refresh token in Redis
//     const refreshToken = this.jwtService.sign(
//       { sub: user._id.toString(), type: 'refresh' },
//       { expiresIn: this.REFRESH_TTL },
//     );

//     await this.redis.set(
//       `refresh_token:${user._id.toString()}`,
//       refreshToken,
//       'EX',
//       this.REFRESH_TTL,
//     );

//     // return {
//     //   accessToken,
//     //   refreshToken,
//     //   user: {
//     //     id: user._id,
//     //     name: user.name,
//     //     email: user.email,
//     //   },
//     //   tenants: tenants.map((t) => ({
//     //     tenantId: t.tenantId.toString(),
//     //     roleId: t.roleId.toString(),
//     //     status: t.status,
//     //   })),
//     //   defaultTenant: tenants[0]?.tenantId.toString() || null,
//     // };
//     return {
//       accessToken,
//       refreshToken,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//       tenants: tenants.map((t) => ({
//         tenantId: t.tenantId._id.toString(),
//         tenantName: t.tenantId.name,
//         role: t.roleId.name,
//         status: t.status,
//       })),
//       defaultTenant: tenants[0]?.tenantId._id.toString() || null,
//     };
//   }

//   /**
//    * STEP 2: Tenant switch removed (frontend decides current tenant)
//    * Backend checks tenant membership dynamically per request
//    */

//   /**
//    * STEP 3: Refresh access token
//    */
//   async refresh(userId: string, refreshToken: string) {
//     const storedToken = await this.redis.get(`refresh_token:${userId}`);
//     if (!storedToken || storedToken !== refreshToken) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }

//     const user = await this.usersService.findById(userId);
//     if (!user) throw new UnauthorizedException('User not found');

//     const payload: JwtPayload = {
//       sub: user._id.toString(),
//       email: user.email,
//       name: user.name,
//     };

//     return {
//       accessToken: this.jwtService.sign(payload, {
//         expiresIn: this.ACCESS_TTL,
//       }),
//     };
//   }

//   /**
//    * STEP 4: Logout
//    */
//   async logout(userId: string) {
//     await this.redis.del(`refresh_token:${userId}`);
//     return { message: 'Logged out from all tenants successfully' };
//   }
// }

// @Injectable()
// export class AuthService {
//   private readonly ACCESS_TTL = '15m';
//   private readonly REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

//   constructor(
//     private readonly usersService: UsersService,
//     private readonly userTenantService: UserTenantService,
//     private readonly jwtService: JwtService,

//     @InjectRedis()
//     private readonly redis: Redis,
//   ) {}

//   /**
//    * STEP 1: Login → return tenants (NO token yet)
//    */
//   async login(dto: LoginDto) {
//     const user = await this.usersService.findByEmail(dto.email);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const validPassword = await bcrypt.compare(dto.password, user.password);
//     if (!validPassword) {
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

//     // Store refresh token in Redis
//     await this.redis.set(
//       `refresh_token:${dto.userId}:${dto.tenantId}`,
//       refreshToken,
//       'EX',
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
//     const storedToken = await this.redis.get(
//       `refresh_token:${userId}:${tenantId}`,
//     );

//     if (!storedToken || storedToken !== refreshToken) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }

//     const membership = await this.userTenantService.getMembership(
//       userId,
//       tenantId,
//     );

//     if (!membership || membership.status !== TenantStatus.ACTIVE) {
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
//    * STEP 4: Logout (optional)
//    */
//   // async logout(userId: string, tenantId: string) {
//   //   await this.redis.del(`refresh_token:${userId}:${tenantId}`);
//   //   return { message: 'Logged out successfully' };
//   // }
//   async logout(userId: string) {
//     const keys = await this.redis.keys(`refresh_token:${userId}:*`);
//     if (keys.length > 0) {
//       await this.redis.del(keys);
//     }
//     return { message: 'Logged out from all tenants successfully' };
//   }
// }

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
