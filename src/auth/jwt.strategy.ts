// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly config: ConfigService) {
//     const secret = config.get<string>('JWT_SECRET');

//     // 🔥 FAIL FAST CHECK (HERE)
//     if (!secret) {
//       throw new Error('JWT_SECRET not defined');
//     }

//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: secret,
//     });
//   }

//   validate(payload: any) {
//     return {
//       sub: payload.sub,
//       role: payload.role,
//       tenantId: payload.tenantId,
//     };
//   }
// }

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    return payload; // attaches to req.user
  }
}

// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'your_jwt_secret_here', // replace with .env variable
//     });
//   }

//   async validate(payload: any) {
//     return payload; // contains userId, tenantId, role
//   }
// }
