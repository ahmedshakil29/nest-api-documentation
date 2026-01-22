import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    // Ensure unique per tenant
    const exists = await this.categoryModel.findOne({
      tenantId,
      name: dto.name,
    });
    if (exists) {
      throw new BadRequestException('Category already exists');
    }

    return this.categoryModel.create({
      tenantId,
      name: dto.name,
    });
  }

  async findAll(tenantId: string) {
    return this.categoryModel.find({
      tenantId,
      isDeleted: false,
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.categoryModel.findOne({
      _id: id,
      tenantId,
      isDeleted: false,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findOneAndUpdate(
      { _id: id, tenantId, isDeleted: false },
      { $set: dto },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(tenantId: string, id: string) {
    const category = await this.categoryModel.findOneAndUpdate(
      { _id: id, tenantId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
