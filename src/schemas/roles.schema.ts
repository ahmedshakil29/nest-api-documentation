// roles.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    required: true,
    uppercase: true,
  })
  name: string;

  @Prop({
    type: [String],
    default: [],
  })
  permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
