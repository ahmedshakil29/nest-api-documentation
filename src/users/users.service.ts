import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  // CREATE USER
  async create(dto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // invalidate cache
    await this.redis.del('users:all');

    return savedUser;
  }

  // GET ALL USERS (REDIS CACHED)
  // async findAll() {
  //   const cacheKey = 'users:all';

  //   const cached = await this.redis.get(cacheKey);
  //   if (cached) {
  //     return JSON.parse(cached);
  //   }

  //   const users = await this.userModel.find().select('-password').exec();

  //   await this.redis.set(cacheKey, JSON.stringify(users), 'EX', 60);

  //   return users;
  // }
  // GET ALL USERS (REDIS CACHED) with console logs
  async findAll() {
    const cacheKey = 'users:all';

    // 1️⃣ Check Redis first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      console.log('🔹 Returning users from Redis cache');
      return JSON.parse(cached);
    }

    // 2️⃣ Cache miss → MongoDB
    console.log('🔹 Fetching users from MongoDB');
    const users = await this.userModel.find().select('-password').exec();

    // 3️⃣ Store in Redis (TTL = 60 seconds)
    await this.redis.set(cacheKey, JSON.stringify(users), 'EX', 60);

    return users;
  }

  // GET USER BY ID
  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  // UPDATE USER
  async update(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.redis.del('users:all');

    return updatedUser;
  }

  // DELETE USER
  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.redis.del('users:all');

    return { message: 'User deleted successfully' };
  }
}

// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   Inject,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import type { Cache } from 'cache-manager';
// import type { Model } from 'mongoose';
// import * as bcrypt from 'bcryptjs';

// import { User, UserDocument } from '../schemas/user.schema';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectModel(User.name)
//     private readonly userModel: Model<UserDocument>,

//     @Inject(CACHE_MANAGER)
//     private readonly cacheManager: Cache,
//   ) {}
//   async onModuleInit() {
//     await this.cacheManager.set('redis:test', 'hello', 120);
//     console.log('🧪 Redis test key written');
//   }
//   // CREATE USER
//   async create(dto: CreateUserDto) {
//     const existingUser = await this.userModel
//       .findOne({ email: dto.email })
//       .exec();

//     if (existingUser) {
//       throw new ConflictException(
//         `User with email ${dto.email} already exists`,
//       );
//     }

//     const hashedPassword = await bcrypt.hash(dto.password, 10);

//     const createdUser = new this.userModel({
//       ...dto,
//       password: hashedPassword,
//     });

//     const savedUser = await createdUser.save();

//     // invalidate cache
//     await this.cacheManager.del('users:all');

//     return savedUser;
//   }

//   // GET ALL USERS (CACHED)
//   // async findAll() {
//   //   const cacheKey = 'users:all';

//   //   const cachedUsers = await this.cacheManager.get(cacheKey);
//   //   if (cachedUsers) {
//   //     return cachedUsers;
//   //   }

//   //   const users = await this.userModel.find().select('-password').exec();

//   //   await this.cacheManager.set(cacheKey, users, 60);

//   //   return users;
//   // }
//   // async findAll() {
//   //   const cacheKey = 'users:all';

//   //   const cachedUsers = await this.cacheManager.get(cacheKey);
//   //   if (cachedUsers) {
//   //     console.log('🚀 Returned from Redis cache');
//   //     return cachedUsers;
//   //   }

//   //   console.log('📦 Returned from MongoDB');

//   //   const users = await this.userModel.find().select('-password').exec();

//   //   await this.cacheManager.set(cacheKey, users, 60);

//   //   return users;
//   // }
//   async findAll() {
//     const cacheKey = 'users:all';

//     const cachedUsers = await this.cacheManager.get(cacheKey);
//     if (cachedUsers) {
//       console.log('🚀 Returned from Redis cache');
//       return cachedUsers;
//     }

//     console.log('📦 Returned from MongoDB');

//     const users = await this.userModel.find().select('-password').exec();

//     await this.cacheManager.set(cacheKey, users, 60); // seconds

//     return users;
//   }

//   // GET USER BY ID
//   async findOne(id: string) {
//     const user = await this.userModel.findById(id).select('-password').exec();

//     if (!user) {
//       throw new NotFoundException(`User with id ${id} not found`);
//     }

//     return user;
//   }

//   // UPDATE USER
//   async update(id: string, dto: UpdateUserDto) {
//     if (dto.email) {
//       const existingUser = await this.userModel
//         .findOne({ email: dto.email })
//         .exec();

//       if (existingUser && existingUser._id.toString() !== id) {
//         throw new ConflictException(`Email ${dto.email} is already in use`);
//       }
//     }

//     if (dto.password) {
//       dto.password = await bcrypt.hash(dto.password, 10);
//     }

//     const updatedUser = await this.userModel
//       .findByIdAndUpdate(id, dto, { new: true })
//       .select('-password')
//       .exec();

//     if (!updatedUser) {
//       throw new NotFoundException(`User with id ${id} not found`);
//     }

//     // invalidate cache
//     await this.cacheManager.del('users:all');

//     return updatedUser;
//   }

//   // DELETE USER
//   async remove(id: string) {
//     const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

//     if (!deletedUser) {
//       throw new NotFoundException(`User with id ${id} not found`);
//     }

//     // invalidate cache
//     await this.cacheManager.del('users:all');

//     return { message: `User with id ${id} deleted successfully` };
//   }
// }

// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as bcrypt from 'bcryptjs'; // <-- use bcryptjs
// import { User, UserDocument } from '../schemas/user.schema';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

//   async create(dto: CreateUserDto) {
//     const existingUser = await this.userModel
//       .findOne({ email: dto.email })
//       .exec();
//     if (existingUser) {
//       throw new ConflictException(
//         `User with email ${dto.email} already exists`,
//       );
//     }

//     const hashedPassword = await bcrypt.hash(dto.password, 10);
//     const createdUser = new this.userModel({
//       ...dto,
//       password: hashedPassword,
//     });
//     return createdUser.save();
//   }

//   /** GET ALL USERS (hide passwords) */
//   async findAll() {
//     return this.userModel.find().select('-password').exec();
//   }

//   /** GET ONE USER BY ID */
//   async findOne(id: string) {
//     const user = await this.userModel.findById(id).select('-password').exec();
//     if (!user) throw new NotFoundException(`User with id ${id} not found`);
//     return user;
//   }

//   async update(id: string, dto: UpdateUserDto) {
//     if (dto.email) {
//       const existingUser = await this.userModel
//         .findOne({ email: dto.email })
//         .exec();
//       if (existingUser && existingUser._id.toString() !== id) {
//         throw new ConflictException(`Email ${dto.email} is already in use`);
//       }
//     }

//     if (dto.password) {
//       dto.password = await bcrypt.hash(dto.password, 10);
//     }

//     const updatedUser = await this.userModel
//       .findByIdAndUpdate(id, dto, { new: true })
//       .select('-password')
//       .exec();

//     if (!updatedUser)
//       throw new NotFoundException(`User with id ${id} not found`);
//     return updatedUser;
//   }

//   /** DELETE USER BY ID */
//   async remove(id: string) {
//     const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
//     if (!deletedUser)
//       throw new NotFoundException(`User with id ${id} not found`);

//     return { message: `User with id ${id} deleted successfully` };
//   }
// }

// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as bcrypt from 'bcryptjs'; // <-- use bcryptjs
// import { User, UserDocument } from '../schemas/user.schema';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

//   /** CREATE USER */
//   // async create(dto: CreateUserDto) {
//   //   // hash password
//   //   const hashedPassword = await bcrypt.hash(dto.password, 10);

//   //   const createdUser = new this.userModel({
//   //     ...dto,
//   //     password: hashedPassword,
//   //   });

//   //   return createdUser.save();
//   // }
//   async create(dto: CreateUserDto) {
//     const existingUser = await this.userModel
//       .findOne({ email: dto.email })
//       .exec();
//     if (existingUser) {
//       throw new ConflictException(
//         `User with email ${dto.email} already exists`,
//       );
//     }

//     const hashedPassword = await bcrypt.hash(dto.password, 10);
//     const createdUser = new this.userModel({
//       ...dto,
//       password: hashedPassword,
//     });
//     return createdUser.save();
//   }

//   /** GET ALL USERS (hide passwords) */
//   async findAll() {
//     return this.userModel.find().select('-password').exec();
//   }

//   /** GET ONE USER BY ID */
//   async findOne(id: string) {
//     const user = await this.userModel.findById(id).select('-password').exec();
//     if (!user) throw new NotFoundException(`User with id ${id} not found`);
//     return user;
//   }

//   /** UPDATE USER BY ID */
//   // async update(id: string, dto: UpdateUserDto) {
//   //   if (dto.password) {
//   //     dto.password = await bcrypt.hash(dto.password, 10);
//   //   }

//   //   const updatedUser = await this.userModel
//   //     .findByIdAndUpdate(id, dto, { new: true })
//   //     .select('-password')
//   //     .exec();

//   //   if (!updatedUser)
//   //     throw new NotFoundException(`User with id ${id} not found`);
//   //   return updatedUser;
//   // }
//   // async update(id: string, dto: UpdateUserDto) {
//   //   if (dto.email) {
//   //     const existingUser = await this.userModel
//   //       .findOne({ email: dto.email })
//   //       .exec();
//   //     if (existingUser && existingUser._id.toString() !== id) {
//   //       throw new Error(`User with email ${dto.email} already exists`);
//   //     }
//   //   }

//   //   if (dto.password) {
//   //     dto.password = await bcrypt.hash(dto.password, 10);
//   //   }

//   //   const updatedUser = await this.userModel
//   //     .findByIdAndUpdate(id, dto, { new: true })
//   //     .select('-password')
//   //     .exec();

//   //   if (!updatedUser)
//   //     throw new NotFoundException(`User with id ${id} not found`);
//   //   return updatedUser;
//   // }
//   async update(id: string, dto: UpdateUserDto) {
//     if (dto.email) {
//       const existingUser = await this.userModel
//         .findOne({ email: dto.email })
//         .exec();
//       if (existingUser && existingUser._id.toString() !== id) {
//         throw new ConflictException(`Email ${dto.email} is already in use`);
//       }
//     }

//     if (dto.password) {
//       dto.password = await bcrypt.hash(dto.password, 10);
//     }

//     const updatedUser = await this.userModel
//       .findByIdAndUpdate(id, dto, { new: true })
//       .select('-password')
//       .exec();

//     if (!updatedUser)
//       throw new NotFoundException(`User with id ${id} not found`);
//     return updatedUser;
//   }

//   /** DELETE USER BY ID */
//   async remove(id: string) {
//     const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
//     if (!deletedUser)
//       throw new NotFoundException(`User with id ${id} not found`);

//     return { message: `User with id ${id} deleted successfully` };
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   private users: { id: number; name: string; email: string }[] = [];

//   create(dto: CreateUserDto) {
//     const user = {
//       id: Date.now(), // simple unique id
//       ...dto,
//     };
//     this.users.push(user);
//     return user;
//   }

//   findAll() {
//     return this.users;
//   }

//   findOne(id: number | string) {
//     // Ensure id is a number
//     const userId = typeof id === 'string' ? parseInt(id, 10) : id;

//     const user = this.users.find((u) => u.id === userId);
//     if (!user) {
//       throw new NotFoundException(`User with id ${userId} not found`);
//     }
//     return user;
//   }

//   update(id: number | string, dto: UpdateUserDto) {
//     const user = this.findOne(id); // will throw if not found
//     Object.assign(user, dto);
//     return user;
//   }

//   remove(id: number | string) {
//     const user = this.findOne(id); // will throw if not found
//     this.users = this.users.filter((u) => u.id !== user.id);
//     return { message: `User with id ${user.id} deleted successfully` };
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   private users = [];

//   create(dto: CreateUserDto) {
//     const user = {
//       id: Date.now(),
//       ...dto,
//     };
//     this.users.push(user);
//     return user;
//   }

//   findAll() {
//     return this.users;
//   }

//   findOne(id: number) {
//     const user = this.users.find((u) => u.id === id);
//     if (!user) throw new NotFoundException('User not found');
//     return user;
//   }

//   update(id: number, dto: UpdateUserDto) {
//     const user = this.findOne(id);
//     Object.assign(user, dto);
//     return user;
//   }

//   remove(id: number) {
//     // Check if user exists
//     const user = this.findOne(id); // will throw NotFoundException if not found
//     if (!user) throw new NotFoundException('User not exits');
//     // Remove the user
//     this.users = this.users.filter((u) => u.id !== id);

//     return { message: `User with id ${id} deleted successfully` };
//   }
// }
