// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * SIGNUP
   */
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  /**
   * LOGIN
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * REFRESH TOKEN
   */
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.userId, dto.refreshToken);
  }

  /**
   * LOGOUT
   */
  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.userId);
  }
}

// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LoginDto } from './dto/login.dto';
// // import { SwitchTenantDto } from './dto/switch-tenant.dto';
// import { RefreshDto } from './dto/refresh.dto';
// import { LogoutDto } from './dto/logout.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   /**
//    * STEP 1: Login → return tenants (no token)
//    */
//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.authService.login(dto);
//   }

//   /**
//    * STEP 2: Switch tenant → issue access + refresh token
//    */
//   // @Post('switch-tenant')
//   // switchTenant(@Body() dto: SwitchTenantDto) {
//   //   return this.authService.switchTenant(dto);
//   // }

//   /**
//    * STEP 3: Refresh access token
//    */
//   // @Post('refresh')
//   // refresh(
//   //   @Body()
//   //   body: {
//   //     userId: string;
//   //     tenantId: string;
//   //     refreshToken: string;
//   //   },
//   // ) {
//   //   return this.authService.refresh(
//   //     body.userId,
//   //     body.tenantId,
//   //     body.refreshToken,
//   //   );
//   // }
//   @Post('refresh')
//   refresh(@Body() dto: RefreshDto) {
//     return this.authService.refresh(dto.userId, dto.refreshToken);
//   }

//   @Post('logout')
//   logout(@Body() dto: LogoutDto) {
//     return this.authService.logout(dto.userId);
//   }
//   /**
//    * STEP 4: Logout (optional)
//    */
//   // @Post('logout')
//   // logout(
//   //   @Body()
//   //   body: {
//   //     userId: string;
//   //     tenantId: string;
//   //   },
//   // ) {
//   //   return this.authService.logout(body.userId, body.tenantId);
//   // }
// }

// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LoginDto } from './dto/login.dto';
// import { SwitchTenantDto } from './dto/switch-tenant.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.authService.login(dto);
//   }

//   @Post('switch-tenant')
//   switchTenant(@Body() dto: SwitchTenantDto) {
//     return this.authService.switchTenant(dto);
//   }
// }
