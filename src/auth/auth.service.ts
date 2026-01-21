import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TenantStatus } from '../schemas/user-tenant.schema';
import { UsersService } from '../users/users.service';
import { UserTenantService } from '../user-tenant/user-tenant.service';
import { LoginDto } from './dto/login.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { JwtPayload } from './types/jwt-payload.type';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTenantService: UserTenantService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * STEP 1
   * Login user and return available tenants
   */
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
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

  async switchTenant(dto: SwitchTenantDto) {
    const { userId, tenantId } = dto;
    const membership = await this.userTenantService.getMembership(
      userId,
      tenantId,
    );

    if (!membership || membership.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException('User does not belong to this tenant');
    }

    const payload: JwtPayload = {
      sub: userId,
      tenantId,
      role: membership.role,
    };

    const accessToken = this.jwtService.sign(payload) as string;

    return { accessToken };
  }
}
