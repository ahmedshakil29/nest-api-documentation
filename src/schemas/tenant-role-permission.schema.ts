import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type TenantRolePermissionDocument =
  HydratedDocument<TenantRolePermission>;

@Schema({ timestamps: true })
export class TenantRolePermission {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
  roleId: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  extraPermissionIds: Types.ObjectId[];
}

export const TenantRolePermissionSchema =
  SchemaFactory.createForClass(TenantRolePermission);
TenantRolePermissionSchema.index({ tenantId: 1, roleId: 1 }, { unique: true });
