import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserTenant,
  UserTenantDocument,
  TenantStatus,
} from '../schemas/user-tenant.schema';
// import { TenantRolePermission } from '../schemas/tenant-role-permission.schema';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
// NEW imports for tenant role permission
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import {
  TenantRolePermission,
  TenantRolePermissionDocument,
} from '../schemas/tenant-role-permission.schema';

@Injectable()
export class UserTenantService {
  // constructor(
  //   @InjectModel(UserTenant.name)
  //   private readonly userTenantModel: Model<UserTenantDocument>,
  // ) {}
  constructor(
    @InjectModel(UserTenant.name)
    private readonly userTenantModel: Model<UserTenantDocument>,

    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,

    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,

    @InjectModel(TenantRolePermission.name)
    private readonly tenantRolePermissionModel: Model<TenantRolePermissionDocument>,
  ) {}

  // ✅ Assign user to tenant
  // async assignUser(dto: CreateUserTenantDto): Promise<UserTenant> {
  //   try {
  //     const membership = new this.userTenantModel({
  //       userId: new Types.ObjectId(dto.userId),
  //       tenantId: new Types.ObjectId(dto.tenantId),
  //       roleId: new Types.ObjectId(dto.roleId),
  //       status: dto.status || TenantStatus.ACTIVE,
  //     });

  //     return await membership.save();
  //   } catch (error: any) {
  //     if (error.code === 11000) {
  //       throw new ConflictException('User is already assigned to this tenant');
  //     }
  //     throw error;
  //   }
  // }
  async assignUser(
    dto: CreateUserTenantDto,
    tenantIdFromHeader: string,
  ): Promise<UserTenant> {
    const membership = new this.userTenantModel({
      userId: new Types.ObjectId(dto.userId),
      // tenantId: new Types.ObjectId(tenantIdFromHeader), // use header
      tenantId: new Types.ObjectId(tenantIdFromHeader || dto.tenantId), // fallback
      roleId: new Types.ObjectId(dto.roleId),
      status: dto.status || TenantStatus.ACTIVE,
    });

    return membership.save();
  }

  // ✅ Fetch active tenants for a user
  async getUserTenants(userId: string) {
    return this.userTenantModel
      .find({ userId: new Types.ObjectId(userId), status: TenantStatus.ACTIVE })
      .populate('tenantId', 'name domain')
      .populate('roleId', 'name permissionIds')
      .select('roleId tenantId status');
  }

  // ✅ Update membership
  async update(id: string, dto: UpdateUserTenantDto): Promise<UserTenant> {
    const membership = await this.userTenantModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.roleId && { roleId: new Types.ObjectId(dto.roleId) }),
        },
        { new: true, runValidators: true },
      )
      .populate('tenantId', 'name domain')
      .populate('roleId', 'name permissionIds');

    if (!membership) throw new NotFoundException('Membership not found');
    return membership;
  }

  // ✅ Remove membership (hard delete)
  async remove(id: string): Promise<void> {
    const membership = await this.userTenantModel.findByIdAndDelete(id);
    if (!membership) throw new NotFoundException('Membership not found');
  }

  // ✅ Get specific membership by user + tenant
  async getMembership(userId: string, tenantId: string) {
    return this.userTenantModel
      .findOne({
        userId: new Types.ObjectId(userId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('tenantId', 'name domain')
      .populate('roleId', 'name permissionIds');
  }

  // Add tenant-specific extra permissions to a role
  async addTenantRolePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ) {
    const role = await this.roleModel.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    const validPermissions = await this.permissionModel.find({
      _id: { $in: permissionIds },
    });
    if (validPermissions.length !== permissionIds.length) {
      throw new ConflictException('Some permissions do not exist in system');
    }

    let tenantRole = await this.tenantRolePermissionModel.findOne({
      tenantId,
      roleId,
    });
    if (!tenantRole) {
      tenantRole = new this.tenantRolePermissionModel({
        tenantId,
        roleId,
        extraPermissionIds: [],
      });
    }

    // Only add permissions that aren't already added
    const currentIds = tenantRole.extraPermissionIds.map((id) => id.toString());
    for (const pid of permissionIds) {
      if (!currentIds.includes(pid.toString()))
        tenantRole.extraPermissionIds.push(pid);
    }

    return tenantRole.save();
  }

  // Remove tenant-added permissions
  async removeTenantRolePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ) {
    const tenantRole = await this.tenantRolePermissionModel.findOne({
      tenantId,
      roleId,
    });
    if (!tenantRole) return null;

    tenantRole.extraPermissionIds = tenantRole.extraPermissionIds.filter(
      (id) => !permissionIds.includes(id.toString()),
    );

    return tenantRole.save();
  }

  // Get effective permissions for a tenant role (global + tenant-added)
  // async getEffectivePermissions(tenantId: string, roleId: string) {
  //   const role = await this.roleModel
  //     .findById(roleId)
  //     .populate('permissionIds');
  //   if (!role) throw new NotFoundException('Role not found');

  //   const tenantOverride = await this.tenantRolePermissionModel.findOne({
  //     tenantId,
  //     roleId,
  //   });

  //   const extra = tenantOverride ? tenantOverride.extraPermissionIds : [];
  //   const effectiveIds = [...role.permissionIds.map((p) => p._id), ...extra];

  //   return this.permissionModel.find({ _id: { $in: effectiveIds } });
  // }
  async getEffectivePermissions(tenantId: string, roleId: string) {
    // Ensure raw ObjectId
    const rId = typeof roleId === 'object' ? roleId._id : roleId;
    const tId = typeof tenantId === 'object' ? tenantId._id : tenantId;

    const role = await this.roleModel.findById(rId).populate('permissionIds');
    if (!role) throw new NotFoundException('Role not found');

    const tenantOverride = await this.tenantRolePermissionModel.findOne({
      tenantId: tId,
      roleId: rId,
    });

    const extra = tenantOverride ? tenantOverride.extraPermissionIds : [];
    const effectiveIds = [...role.permissionIds.map((p) => p._id), ...extra];

    return this.permissionModel.find({ _id: { $in: effectiveIds } });
  }
}

// // src/user-tenant/user-tenant.service.ts
// import {
//   Injectable,
//   ConflictException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import {
//   UserTenant,
//   UserTenantDocument,
//   TenantStatus,
// } from '../schemas/user-tenant.schema';
// import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
// import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';

// @Injectable()
// export class UserTenantService {
//   constructor(
//     @InjectModel(UserTenant.name)
//     private readonly userTenantModel: Model<UserTenantDocument>,
//   ) {}

//   // ✅ Assign user to tenant
//   async assignUser(dto: CreateUserTenantDto): Promise<UserTenant> {
//     try {
//       const membership = new this.userTenantModel({
//         userId: new Types.ObjectId(dto.userId),
//         tenantId: new Types.ObjectId(dto.tenantId),
//         roleId: new Types.ObjectId(dto.roleId),
//         status: dto.status || TenantStatus.ACTIVE,
//       });

//       return await membership.save();
//     } catch (error: any) {
//       if (error.code === 11000) {
//         throw new ConflictException('User is already assigned to this tenant');
//       }
//       throw error;
//     }
//   }

//   // ✅ Fetch active tenants for a user
//   async getUserTenants(userId: string) {
//     return this.userTenantModel
//       .find({ userId: new Types.ObjectId(userId), status: TenantStatus.ACTIVE })
//       .populate('tenantId', 'name domain')
//       .populate('roleId', 'name')
//       .select('roleId tenantId status');
//   }

//   // ✅ Update membership
//   async update(id: string, dto: UpdateUserTenantDto): Promise<UserTenant> {
//     const membership = await this.userTenantModel
//       .findByIdAndUpdate(
//         id,
//         {
//           ...dto,
//           ...(dto.roleId && { roleId: new Types.ObjectId(dto.roleId) }),
//         },
//         { new: true, runValidators: true },
//       )
//       .populate('tenantId', 'name domain')
//       .populate('roleId', 'name');

//     if (!membership) throw new NotFoundException('Membership not found');
//     return membership;
//   }

//   // ✅ Remove membership (hard delete)
//   async remove(id: string): Promise<void> {
//     const membership = await this.userTenantModel.findByIdAndDelete(id);
//     if (!membership) throw new NotFoundException('Membership not found');
//   }

//   // ✅ Get specific membership by user + tenant
//   async getMembership(userId: string, tenantId: string) {
//     return this.userTenantModel
//       .findOne({
//         userId: new Types.ObjectId(userId),
//         tenantId: new Types.ObjectId(tenantId),
//       })
//       .populate('tenantId', 'name domain')
//       .populate('roleId', 'name');
//   }
// }

// // src/user-tenant/user-tenant.service.ts
// import {
//   Injectable,
//   ConflictException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   UserTenant,
//   UserTenantDocument,
//   TenantStatus,
// } from '../schemas/user-tenant.schema';
// import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
// import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';

// @Injectable()
// export class UserTenantService {
//   constructor(
//     @InjectModel(UserTenant.name)
//     private readonly userTenantModel: Model<UserTenantDocument>,
//   ) {}

//   // ✅ Assign user to tenant
//   async assignUser(dto: CreateUserTenantDto): Promise<UserTenant> {
//     try {
//       const membership = new this.userTenantModel({
//         userId: dto.userId,
//         tenantId: dto.tenantId,
//         role: dto.roleId,
//         status: dto.status || TenantStatus.ACTIVE,
//       });

//       return await membership.save();
//     } catch (error) {
//       if (error.code === 11000) {
//         throw new ConflictException('User is already assigned to this tenant');
//       }
//       throw error;
//     }
//   }

//   // ✅ Fetch tenants for a user
//   async getUserTenants(userId: string) {
//     return this.userTenantModel
//       .find({ userId, status: TenantStatus.ACTIVE })
//       .populate('tenantId', 'name domain')
//       .select('role tenantId status');
//   }

//   // ✅ Update membership
//   async update(id: string, dto: UpdateUserTenantDto): Promise<UserTenant> {
//     const membership = await this.userTenantModel.findByIdAndUpdate(id, dto, {
//       new: true,
//       runValidators: true,
//     });
//     if (!membership) throw new NotFoundException('Membership not found');
//     return membership;
//   }

//   // ✅ Remove (soft delete) membership
//   async remove(id: string): Promise<void> {
//     const membership = await this.userTenantModel.findByIdAndDelete(id);
//     if (!membership) throw new NotFoundException('Membership not found');
//   }

//   // ✅ Get specific membership by user+tenant
//   async getMembership(userId: string, tenantId: string) {
//     return this.userTenantModel.findOne({ userId, tenantId });
//   }
// }

//****************************** old */
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import {
//   UserTenant,
//   UserTenantDocument,
//   TenantStatus,
// } from '../schemas/user-tenant.schema';

// @Injectable()
// export class UserTenantService {
//   constructor(
//     @InjectModel(UserTenant.name)
//     private readonly userTenantModel: Model<UserTenantDocument>,
//   ) {}

//   async getUserTenants(userId: string): Promise<UserTenantDocument[]> {
//     return this.userTenantModel
//       .find({
//         userId: new Types.ObjectId(userId),
//         status: TenantStatus.ACTIVE,
//       })
//       .populate('tenantId')
//       .exec();
//   }

//   async getMembership(
//     userId: string,
//     tenantId: string,
//   ): Promise<UserTenantDocument | null> {
//     return this.userTenantModel.findOne({
//       userId: new Types.ObjectId(userId),
//       tenantId: new Types.ObjectId(tenantId),
//       status: TenantStatus.ACTIVE,
//     });
//   }
// }
