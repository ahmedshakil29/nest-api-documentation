// import { SetMetadata } from '@nestjs/common';

// export const PERMISSIONS_KEY = 'permissions';

// export const RequirePermission = (...permissions: string[]) =>
//   SetMetadata(PERMISSIONS_KEY, permissions);

// require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export type PermissionMode = 'AND' | 'OR';

export interface PermissionMeta {
  permissions: string[];
  mode: PermissionMode;
}

export const RequirePermission = (
  permissions: string[] | string,
  mode: PermissionMode = 'AND',
) => {
  const perms = Array.isArray(permissions) ? permissions : [permissions];

  return SetMetadata(PERMISSIONS_KEY, {
    permissions: perms,
    mode,
  });
};
