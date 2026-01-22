// src/permissions/schemas/permission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  key: string; // e.g. "user.create", "tenant.read"

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
