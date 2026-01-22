import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user; // from JwtAuthGuard
    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant not found in token');
    }

    // OPTIONAL: if tenantId comes from request
    const tenantIdFromRequest =
      request.params?.tenantId ||
      request.body?.tenantId ||
      request.headers['x-tenant-id'];

    // If route doesn't specify tenant → allow
    if (!tenantIdFromRequest) {
      return true;
    }

    if (tenantIdFromRequest !== user.tenantId) {
      throw new ForbiddenException('Access denied for this tenant');
    }

    return true;
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { JwtPayload } from '../types/jwt-payload.type';

// interface AuthenticatedRequest extends Request {
//   user: JwtPayload;
// }

// @Injectable()
// export class TenantGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

//     if (!request.user?.tenantId) {
//       throw new ForbiddenException('Tenant context missing');
//     }

//     return true;
//   }
// }
