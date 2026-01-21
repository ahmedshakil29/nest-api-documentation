// user-tenant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserTenantDocument = HydratedDocument<UserTenant>;

export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Schema({ timestamps: true })
export class UserTenant {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    enum: TenantRole,
    default: TenantRole.MEMBER,
  })
  role: TenantRole;

  @Prop({
    enum: ['ACTIVE', 'INVITED'],
    default: 'ACTIVE',
  })
  status: string;
}

export const UserTenantSchema = SchemaFactory.createForClass(UserTenant);

UserTenantSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
