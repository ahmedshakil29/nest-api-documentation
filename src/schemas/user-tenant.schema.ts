import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserTenantDocument = HydratedDocument<UserTenant>;

export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  SUSPENDED = 'SUSPENDED',
}

// @Schema({ timestamps: true })
// export class UserTenant {
//   @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
//   userId: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
//   tenantId: Types.ObjectId;

//   @Prop({ type: String, enum: TenantRole, default: TenantRole.MEMBER })
//   role: TenantRole;

//   @Prop({ type: String, enum: TenantStatus, default: TenantStatus.ACTIVE })
//   status: TenantStatus;
// }
@Schema({ timestamps: true })
export class UserTenant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: String, enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;
}

export const UserTenantSchema = SchemaFactory.createForClass(UserTenant);

// Unique index: user + tenant
UserTenantSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
