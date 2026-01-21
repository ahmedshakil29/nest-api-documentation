import { TenantRole } from '../../schemas/user-tenant.schema';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: TenantRole;
}
