import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketGateway } from './ticket.gateway';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { TicketProcessor } from './ticket.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User]),
    BullModule.registerQueue({
      name: 'tickets',
    }),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketGateway, TicketProcessor],
  exports: [TicketService],
})
export class TicketModule {} 