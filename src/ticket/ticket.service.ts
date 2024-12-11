import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.role !== UserRole.VENDOR) {
      throw new ForbiddenException('Only vendors can create tickets');
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      vendor: user,
      availableQuantity: createTicketDto.quantity,
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll() {
    return this.ticketRepository.find({
      relations: ['vendor'],
    });
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    const ticket = await this.findOne(id);

    if (ticket.vendor.id !== userId) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async remove(id: string, userId: string) {
    const ticket = await this.findOne(id);

    if (ticket.vendor.id !== userId) {
      throw new ForbiddenException('You can only delete your own tickets');
    }

    await this.ticketRepository.remove(ticket);
    return { success: true };
  }

  async updateAvailability(id: string, quantity: number) {
    const ticket = await this.findOne(id);
    ticket.availableQuantity = quantity;
    return this.ticketRepository.save(ticket);
  }
} 