import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { Transaction } from '../entities/transaction.entity';
import { PayChanguModule } from '../paychangu/paychangu.module';
import { WalletModule } from '../wallet/wallet.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({
      name: 'purchases',
    }),
    PayChanguModule,
    WalletModule,
    TicketModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {} 