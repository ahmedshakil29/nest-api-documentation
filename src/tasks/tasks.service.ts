import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'refreshUsersCache',
    timeZone: 'Asia/Dhaka', // adjust to your timezone
  })
  async refreshUsersCache() {
    try {
      this.logger.log('🔄 Refreshing users cache...');
      // Call findAll() to refresh Redis cache
      await this.usersService.findAll();
      this.logger.log('✅ Users cache refreshed successfully');
    } catch (error) {
      this.logger.error('❌ Error refreshing users cache', error);
    }
  }

  @Interval(300000) // every 5 minutes = 300,000 ms
  async refreshUsersCacheInterval() {
    try {
      this.logger.log('🔄 [Interval] Refreshing users cache...');
      await this.usersService.findAll();
      this.logger.log('✅ ✅ [Interval] Users cache refreshed successfully');
    } catch (error) {
      this.logger.error('❌ ❌ [Interval] Error refreshing users cache', error);
    }
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, Interval, Timeout } from '@nestjs/schedule';

// @Injectable()
// export class TasksService {
//   private readonly logger = new Logger(TasksService.name);

//   // Run every 5 seconds
//   @Interval(5000)
//   handleInterval() {
//     this.logger.log('This runs every 5 seconds');
//   }

//   // Run once after 10 seconds
//   @Timeout(10000)
//   handleTimeout() {
//     this.logger.log('This runs once after 10 seconds');
//   }

//   // Run every minute using cron syntax
//   @Cron('45 * * * * *') // At second 45 of every minute
//   handleCron() {
//     this.logger.log('This runs at 45 seconds every minute');
//   }
// }
