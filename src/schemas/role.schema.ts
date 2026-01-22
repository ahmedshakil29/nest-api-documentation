// src/roles/schemas/role.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, uppercase: true })
  name: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissionIds: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// // src/roles/schemas/role.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Types } from 'mongoose';

// export type RoleDocument = HydratedDocument<Role>;

// @Schema({ timestamps: true })
// export class Role {
//   @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
//   tenantId: Types.ObjectId;

//   @Prop({ required: true, uppercase: true })
//   name: string; // ADMIN, MANAGER, MEMBER

//   @Prop({
//     type: [{ type: Types.ObjectId, ref: 'Permission' }],
//     default: [],
//   })
//   permissionIds: Types.ObjectId[];
// }

// export const RoleSchema = SchemaFactory.createForClass(Role);
// RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// // src/roles/schemas/role.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Types } from 'mongoose';

// export type RoleDocument = HydratedDocument<Role>;

// @Schema({ timestamps: true })
// export class Role {
//   @Prop({
//     type: Types.ObjectId,
//     ref: 'Tenant',
//     required: true,
//     index: true,
//   })
//   tenantId: Types.ObjectId;

//   @Prop({
//     required: true,
//     uppercase: true,
//     index: true,
//   })
//   name: string; // ADMIN, MANAGER, MEMBER

//   @Prop({
//     type: [{ type: Types.ObjectId, ref: 'Permission' }],
//     default: [],
//   })
//   permissionIds: Types.ObjectId[];
// }

// export const RoleSchema = SchemaFactory.createForClass(Role);

// // unique role name per tenant
// RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// // roles.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Types } from 'mongoose';

// export type RoleDocument = HydratedDocument<Role>;

// @Schema({ timestamps: true })
// export class Role {
//   @Prop({
//     type: Types.ObjectId,
//     ref: 'Tenant',
//     required: true,
//     index: true,
//   })
//   tenantId: Types.ObjectId;

//   @Prop({
//     required: true,
//     uppercase: true,
//   })
//   name: string;

//   @Prop({
//     type: [String],
//     default: [],
//   })
//   permissions: string[];
// }

// export const RoleSchema = SchemaFactory.createForClass(Role);
