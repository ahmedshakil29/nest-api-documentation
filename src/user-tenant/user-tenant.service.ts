// src/user-tenant/user-tenant.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserTenant,
  UserTenantDocument,
  TenantRole,
  TenantStatus,
} from '../schemas/user-tenant.schema';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';

@Injectable()
export class UserTenantService {
  constructor(
    @InjectModel(UserTenant.name)
    private readonly userTenantModel: Model<UserTenantDocument>,
  ) {}

  // ✅ Assign user to tenant
  async assignUser(dto: CreateUserTenantDto): Promise<UserTenant> {
    try {
      const membership = new this.userTenantModel({
        userId: dto.userId,
        tenantId: dto.tenantId,
        role: dto.role || TenantRole.MEMBER,
        status: dto.status || TenantStatus.ACTIVE,
      });

      return await membership.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User is already assigned to this tenant');
      }
      throw error;
    }
  }

  // ✅ Fetch tenants for a user
  async getUserTenants(userId: string) {
    return this.userTenantModel
      .find({ userId, status: TenantStatus.ACTIVE })
      .populate('tenantId', 'name domain')
      .select('role tenantId status');
  }

  // ✅ Update membership
  async update(id: string, dto: UpdateUserTenantDto): Promise<UserTenant> {
    const membership = await this.userTenantModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!membership) throw new NotFoundException('Membership not found');
    return membership;
  }

  // ✅ Remove (soft delete) membership
  async remove(id: string): Promise<void> {
    const membership = await this.userTenantModel.findByIdAndDelete(id);
    if (!membership) throw new NotFoundException('Membership not found');
  }

  // ✅ Get specific membership by user+tenant
  async getMembership(userId: string, tenantId: string) {
    return this.userTenantModel.findOne({ userId, tenantId });
  }
}
