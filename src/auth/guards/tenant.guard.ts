import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserTenantService } from 'src/user-tenant/user-tenant.service';
import { TenantStatus } from '../../schemas/user-tenant.schema';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private userTenantService: UserTenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.sub;
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new ForbiddenException('Tenant not specified');
    }

    const membership = await this.userTenantService.getMembership(
      userId,
      tenantId,
    );

    // if (!membership || membership.status !== 'ACTIVE') {
    //   throw new ForbiddenException('Unauthorized tenant');
    // }
    if (!membership || membership.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException('Unauthorized tenant');
    }

    req.tenant = membership; // 🔥 required for PermissionGuard
    return true;
  }
}

// @Injectable()
// export class TenantGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();

//     const user = request.user; // from JwtAuthGuard
//     if (!user || !user.tenantId) {
//       throw new ForbiddenException('Tenant not found in token');
//     }

//     // OPTIONAL: if tenantId comes from request
//     const tenantIdFromRequest =
//       request.params?.tenantId ||
//       request.body?.tenantId ||
//       request.headers['x-tenant-id'];

//     // If route doesn't specify tenant → allow
//     if (!tenantIdFromRequest) {
//       return true;
//     }

//     if (tenantIdFromRequest !== user.tenantId) {
//       throw new ForbiddenException('Access denied for this tenant');
//     }

//     return true;
//   }
// }

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
