import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { UserTenantService } from 'src/user-tenant/user-tenant.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userTenantService: UserTenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const membership = req.tenant;

    if (!membership?.roleId || !membership?.tenantId) {
      throw new ForbiddenException('Role or Tenant not found');
    }

    // Fetch effective permissions (global + tenant-added)
    const effectivePermissions =
      await this.userTenantService.getEffectivePermissions(
        membership.tenantId,
        membership.roleId,
      );

    // Extract permission keys safely
    const permissionKeys = effectivePermissions.map((p) =>
      typeof p === 'object' && p.key ? p.key : p.toString(),
    );

    const hasPermission = requiredPermissions.every((perm) =>
      permissionKeys.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
// import { UserTenantService } from 'src/user-tenant/user-tenant.service';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly userTenantService: UserTenantService, // inject service
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
//       PERMISSIONS_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     // No permissions required → allow
//     if (!requiredPermissions || requiredPermissions.length === 0) return true;

//     const req = context.switchToHttp().getRequest();
//     const membership = req.tenant;

//     if (!membership?.roleId || !membership?.tenantId) {
//       throw new ForbiddenException('Role or Tenant not found');
//     }

//     // 🔥 Fetch effective permissions (global + tenant-added)
//     const effectivePermissions =
//       await this.userTenantService.getEffectivePermissions(
//         membership.tenantId.toString(),
//         membership.roleId.toString(),
//       );

//     const permissionKeys = effectivePermissions.map((p) => p.key);

//     // Check all required permissions
//     const hasPermission = requiredPermissions.every((perm) =>
//       permissionKeys.includes(perm),
//     );

//     if (!hasPermission) {
//       throw new ForbiddenException('Insufficient permissions');
//     }

//     return true;
//   }
// }

// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
// import { RolesService } from '../../roles/roles.service';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly rolesService: RolesService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
//       PERMISSIONS_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     // No permissions required → allow
//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return true;
//     }

//     const req = context.switchToHttp().getRequest();

//     /**
//      * Comes from TenantGuard
//      * req.tenant = UserTenant document
//      */
//     const membership = req.tenant;

//     if (!membership?.roleId) {
//       throw new ForbiddenException('Role not found');
//     }

//     const role = await this.rolesService.findByIdWithPermissions(
//       membership.roleId,
//     );

//     if (!role) {
//       throw new ForbiddenException('Role not found');
//     }

//     const userPermissions = role.permissionIds.map(
//       (p) => p.key, // permission.key
//     );

//     const hasPermission = requiredPermissions.every((perm) =>
//       userPermissions.includes(perm),
//     );

//     if (!hasPermission) {
//       throw new ForbiddenException(
//         'Insufficient permissions. tmr permissions nai',
//       );
//     }

//     return true;
//   }
// }
