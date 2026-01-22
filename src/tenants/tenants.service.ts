// src/tenants/tenants.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../schemas/tenants.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async findByDomain(domain: string): Promise<TenantDocument | null> {
    return this.tenantModel.findOne({
      domain: domain.toLowerCase(),
      isDeleted: false,
    });
  }
  // ✅ Create Tenant
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Normalize domain
    createTenantDto.domain = createTenantDto.domain.toLowerCase().trim();

    try {
      const tenant = new this.tenantModel(createTenantDto);
      return await tenant.save();
    } catch (error) {
      // Handle unique domain conflict
      if (error.code === 11000 && error.keyPattern?.domain) {
        throw new ConflictException(`${createTenantDto.domain} already exists`);
      }
      throw error;
    }
  }

  // ✅ Get all tenants (excluding deleted)
  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find({ isDeleted: false }).exec();
  }

  // ✅ Get one tenant by ID
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant || tenant.isDeleted) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  // ✅ Update tenant
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    if (updateTenantDto.domain) {
      // Normalize domain if updating
      updateTenantDto.domain = updateTenantDto.domain.toLowerCase().trim();
    }

    try {
      const tenant = await this.tenantModel
        .findByIdAndUpdate(id, updateTenantDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!tenant || tenant.isDeleted) {
        throw new NotFoundException('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.domain) {
        throw new ConflictException(`${updateTenantDto.domain} already exists`);
      }
      throw error;
    }
  }

  // ✅ Soft delete tenant
  async remove(id: string): Promise<void> {
    const tenant = await this.tenantModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
  }
}
