import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Health check (MOST specific)
  @SkipThrottle()
  @Get('health/check')
  health() {
    return { status: 'ok' };
  }

  // Current user profile
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  getProfile(@Req() req) {
    return {
      userId: req.user.sub,
      tenantId: req.user.tenantId,
      role: req.user.role,
    };
  }
  // Existing routes...
  @Throttle({ medium: { limit: 20, ttl: 10 } })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Throttle({ medium: { limit: 20, ttl: 10 } })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Throttle({ short: { limit: 1, ttl: 1 } })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Throttle({ medium: { limit: 10, ttl: 10 } })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Throttle({ short: { limit: 2, ttl: 1 } })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // // Health check
  // @SkipThrottle()
  // @Get('health/check')
  // health() {
  //   return { status: 'ok' };
  // }

  // // ✅ New route: current user profile (multi-tenant aware)
  // @UseGuards(JwtAuthGuard, TenantGuard)
  // @Get('me')
  // async getProfile(@Req() req) {
  //   // req.user.sub comes from JWT
  //   return this.usersService.findOne(req.user.sub);
  // }
}

// import {
//   Controller,
//   Get,
//   Post,
//   Patch,
//   Delete,
//   Param,
//   Body,
// } from '@nestjs/common';
// import { Throttle, SkipThrottle } from '@nestjs/throttler';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   // Get all users
//   @Throttle({ medium: { limit: 20, ttl: 10 } }) // TTL in seconds
//   @Get()
//   findAll() {
//     return this.usersService.findAll();
//   }

//   // Get one user by ID
//   @Throttle({ medium: { limit: 20, ttl: 10 } })
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(id);
//   }

//   // Create user
//   @Throttle({ short: { limit: 1, ttl: 1 } })
//   @Post()
//   create(@Body() dto: CreateUserDto) {
//     return this.usersService.create(dto);
//   }

//   // Update user
//   @Throttle({ medium: { limit: 10, ttl: 10 } })
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
//     return this.usersService.update(id, dto);
//   }

//   // Delete user
//   @Throttle({ short: { limit: 2, ttl: 1 } })
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(id);
//   }

//   // Health check
//   @SkipThrottle()
//   @Get('health/check')
//   health() {
//     return { status: 'ok' };
//   }
// }
//-------------------- old
// import {
//   Controller,
//   Get,
//   Post,
//   Patch,
//   Delete,
//   Param,
//   Body,
// } from '@nestjs/common';
// import { Throttle, SkipThrottle } from '@nestjs/throttler';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Throttle({ medium: { limit: 20, ttl: 10_000 } })
//   @Get()
//   findAll() {
//     return this.usersService.findAll();
//   }

//   @Throttle({ medium: { limit: 20, ttl: 10_000 } })
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(id);
//   }

//   @Throttle({ short: { limit: 1, ttl: 1000 } })
//   @Post()
//   create(@Body() dto: CreateUserDto) {
//     return this.usersService.create(dto);
//   }

//   @Throttle({ medium: { limit: 10, ttl: 10_000 } })
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
//     return this.usersService.update(id, dto);
//   }

//   @Throttle({ short: { limit: 2, ttl: 1000 } })
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(id);
//   }

//   @SkipThrottle()
//   @Get('health/check')
//   health() {
//     return { status: 'ok' };
//   }
// }

// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Patch,
//   Delete,
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @ApiTags('Users')
// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post()
//   @ApiOperation({ summary: 'Create a new user' })
//   create(@Body() dto: CreateUserDto) {
//     return this.usersService.create(dto);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Get all users' })
//   findAll() {
//     return this.usersService.findAll();
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get user by ID' })
//   @ApiParam({ name: 'id', example: 1 })
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(+id);
//   }

//   @Patch(':id')
//   @ApiOperation({ summary: 'Update user' })
//   update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
//     return this.usersService.update(+id, dto);
//   }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete user' })
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(+id);
//   }
// }
