import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { PayChanguService } from '../paychangu/paychangu.service';
import { WalletService } from '../wallet/wallet.service';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly payChanguService: PayChanguService,
    private readonly walletService: WalletService,
    private readonly ticketService: TicketService,
  ) {}

  async createPurchase(userId: string, ticketId: string, quantity: number) {
    const ticket = await this.ticketService.findOne(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.availableQuantity < quantity) {
      throw new BadRequestException('Not enough tickets available');
    }

    const totalAmount = ticket.price * quantity;

    // Create and save the transaction
    const transaction = this.transactionRepository.create({
      amount: totalAmount,
      type: TransactionType.PURCHASE,
      status: TransactionStatus.PENDING,
      user: { id: userId } as any, // Ensure compatibility with DeepPartial
      ticket: { id: ticketId } as any,
    });

    await this.transactionRepository.save(transaction);

    // Initiate payment
    const paymentResponse = await this.payChanguService.createPayment(
      totalAmount,
      transaction.id.toString(),
    );

    return {
      transactionId: transaction.id,
      paymentUrl: paymentResponse.payment_url,
    };
  }

  async handlePaymentWebhook(payload: any) {
    const { order_id, status } = payload;

    if (!order_id || !status) {
      throw new BadRequestException('Invalid webhook payload');
    }

    const transaction = await this.transactionRepository.findOne({
      where: { id: order_id },
      relations: ['ticket', 'ticket.vendor'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction already processed');
    }

    if (status === 'COMPLETED') {
      // Update ticket availability
      const quantity = Math.floor(transaction.amount / transaction.ticket.price);
      await this.ticketService.updateAvailability(
        transaction.ticket.id,
        transaction.ticket.availableQuantity - quantity,
      );

      // Update vendor's wallet
      const vendorWallet = await this.walletService.getWallet(transaction.ticket.vendor.id);
      await this.walletService.updateWalletBalance(vendorWallet.id.toString(), transaction.amount);

      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED;
      await this.transactionRepository.save(transaction);

      return { success: true };
    } else {
      // Handle failed payment
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      throw new BadRequestException('Payment failed');
    }
  }

  async getUserPurchases(userId: string) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['ticket'],
    });
  }
}
