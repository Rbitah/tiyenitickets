import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Ticket } from './entities/ticket.entity';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { WalletModule } from './wallet/wallet.module';
import { PurchaseModule } from './purchase/purchase.module';
import { PayChanguModule } from './paychangu/paychangu.module';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [User, Wallet, Ticket, Transaction],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TicketModule,
    WalletModule,
    PurchaseModule,
    PayChanguModule,
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 10,
      }],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'purchases',
    }),
  ],
})
export class AppModule {}
