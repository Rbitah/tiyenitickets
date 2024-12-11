import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TicketService } from './ticket.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Lock } from '../utils/lock';

@Processor('tickets')
export class TicketProcessor {
  private ticketLocks: { [key: string]: Lock } = {};

  constructor(
    private readonly ticketService: TicketService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  @Process('purchase')
  async handlePurchase(job: Job<{ userId: string; ticketId: string; quantity: number }>) {
    const { userId, ticketId, quantity } = job.data;
    
    // Get or create lock for this ticket
    if (!this.ticketLocks[ticketId]) {
      this.ticketLocks[ticketId] = new Lock();
    }
    const lock = this.ticketLocks[ticketId];

    try {
      await lock.acquire();
      
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        select: ['id', 'availableQuantity', 'price'],
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      if (ticket.availableQuantity < quantity) {
        throw new Error('Not enough tickets available');
      }

      // Reserve the tickets
      ticket.availableQuantity -= quantity;
      await this.ticketRepository.save(ticket);

      return { success: true, ticketId, quantity };
    } finally {
      lock.release();
    }
  }
} 