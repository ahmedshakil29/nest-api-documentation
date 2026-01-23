import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserTenantService } from './user-tenant.service';
import { UserTenantController } from './user-tenant.controller';
import { UserTenant, UserTenantSchema } from '../schemas/user-tenant.schema';
import {
  TenantRolePermission,
  TenantRolePermissionSchema,
} from '../schemas/tenant-role-permission.schema';

import { RolesModule } from '../roles/roles.module'; // 🔥 import RolesModule
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTenant.name, schema: UserTenantSchema },
      { name: TenantRolePermission.name, schema: TenantRolePermissionSchema }, // 🔥 Add TenantRolePermission
    ]),
    RolesModule, // 🔥 add this
    PermissionsModule,
  ],
  controllers: [UserTenantController],
  providers: [UserTenantService],
  exports: [UserTenantService],
})
export class UserTenantModule {}

// // src/user-tenant/user-tenant.module.ts
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserTenantService } from './user-tenant.service';
// import { UserTenantController } from './user-tenant.controller';
// import { UserTenant, UserTenantSchema } from '../schemas/user-tenant.schema';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: UserTenant.name, schema: UserTenantSchema },
//     ]),
//   ],
//   controllers: [UserTenantController],
//   providers: [UserTenantService],
//   exports: [UserTenantService],
// })
// export class UserTenantModule {}
