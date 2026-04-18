import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import {
  CronExpression,
  ScheduleModule,
  SchedulerRegistry,
} from '@nestjs/schedule';
import { CronJob } from 'cron/dist/job';
import { JobModule } from './job/job.module';
import { Job } from './job/entities/job.entity';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'asd.12345',
      database: 'hello',
      entities: [User, Job],
      synchronize: true,
      connectorPackage: 'mysql2',
      logging: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: Number(configService.get<string>('MAIL_PORT')),
          secure: configService.get<string>('MAIL_SECURE') === 'true',
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
    }),
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// export class AppModule implements OnApplicationBootstrap {
//   @Inject(SchedulerRegistry)
//   schedulerRegistry: SchedulerRegistry;

//   onApplicationBootstrap() {
//     const job = new CronJob(CronExpression.EVERY_SECOND, () => {
//       console.log('run job');
//     });
//     this.schedulerRegistry.addCronJob('job1', job);
//     job.start();
//     setTimeout(() => {
//       this.schedulerRegistry.deleteCronJob('job1');
//     }, 5000);

//     const intervalRef = setInterval(() => {
//       console.log('run interval');
//     }, 1000);
//     this.schedulerRegistry.addInterval('interval1', intervalRef);
//     setTimeout(() => {
//       this.schedulerRegistry.deleteInterval('interval1');
//       clearInterval(intervalRef);
//     }, 5000);
//     const timeoutRef = setTimeout(() => {
//       console.log('run timeout');
//     }, 3000);
//     this.schedulerRegistry.addTimeout('timeout1', timeoutRef);
//     setTimeout(() => {
//       this.schedulerRegistry.deleteTimeout('timeout1');
//       clearTimeout(timeoutRef);
//     }, 5000);
//   }
// }
export class AppModule {}
