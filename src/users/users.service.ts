import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: { id: number; name: string; email: string }[] = [];

  create(dto: CreateUserDto) {
    const user = {
      id: Date.now(), // simple unique id
      ...dto,
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }

  findOne(id: number | string) {
    // Ensure id is a number
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;

    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  update(id: number | string, dto: UpdateUserDto) {
    const user = this.findOne(id); // will throw if not found
    Object.assign(user, dto);
    return user;
  }

  remove(id: number | string) {
    const user = this.findOne(id); // will throw if not found
    this.users = this.users.filter((u) => u.id !== user.id);
    return { message: `User with id ${user.id} deleted successfully` };
  }
}

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
