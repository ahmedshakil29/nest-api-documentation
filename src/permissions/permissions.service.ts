// src/permissions/permissions.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  async create(dto: CreatePermissionDto) {
    const exists = await this.permissionModel.findOne({ key: dto.key });
    if (exists) {
      throw new BadRequestException('Permission already exists');
    }

    return this.permissionModel.create(dto);
  }

  async findAll() {
    return this.permissionModel.find().sort({ key: 1 });
  }

  async findOne(id: string) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async remove(id: string) {
    const permission = await this.permissionModel.findByIdAndDelete(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return { message: 'Permission deleted successfully' };
  }
}
