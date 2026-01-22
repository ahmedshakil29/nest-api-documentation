import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.roleModel.findOne({
      name: dto.name.toUpperCase(),
    });
    if (exists) throw new BadRequestException('Role already exists');

    return this.roleModel.create({
      name: dto.name.toUpperCase(),
      permissionIds: dto.permissionIds || [],
    });
  }

  async findAll() {
    return this.roleModel
      .find()
      .populate('permissionIds', 'key description')
      .sort({ name: 1 });
  }

  async findOne(id: string) {
    const role = await this.roleModel
      .findById(id)
      .populate('permissionIds', 'key description');
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.roleModel.findByIdAndUpdate(
      id,
      {
        ...(dto.name && { name: dto.name.toUpperCase() }),
        ...(dto.permissionIds && { permissionIds: dto.permissionIds }),
      },
      { new: true },
    );
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async remove(id: string) {
    const role = await this.roleModel.findByIdAndDelete(id);
    if (!role) throw new NotFoundException('Role not found');
    return { message: 'Role deleted successfully' };
  }

  async findByIdWithPermissions(roleId: string) {
    return this.roleModel
      .findById(roleId)
      .populate('permissionIds') // Permission documents
      .lean();
  }
}
