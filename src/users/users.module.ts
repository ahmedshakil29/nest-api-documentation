import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UserTenantModule } from '../user-tenant/user-tenant.module'; // 🔥

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserTenantModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ✅ Make it available outside this module
})
export class UsersModule {}

// import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';

// @Module({
//   controllers: [UsersController],
//   providers: [UsersService],
// })
// export class UsersModule {}
