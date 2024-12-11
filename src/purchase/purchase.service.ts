import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { PayChanguService } from '../paychangu/paychangu.service';
import { WalletService } from '../wallet/wallet.service';
import { TicketService } from '../ticket/ticket.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly payChanguService: PayChanguService,
    private readonly walletService: WalletService,
    private readonly ticketService: TicketService,
    @InjectQueue('purchases') private readonly purchasesQueue: Queue,
  ) {}

  async createPurchase(userId: string, ticketId: string, quantity: number) {
    // Add to queue and wait for result
    const job = await this.purchasesQueue.add('purchase', {
      userId,
      ticketId,
      quantity,
    }, {
      attempts: 1, // No retries for failed purchases
      timeout: 30000, // 30 second timeout
      removeOnComplete: true,
    });

    const result = await job.finished();
    if (!result.success) {
      throw new HttpException('Failed to reserve tickets', HttpStatus.BAD_REQUEST);
    }

    // Continue with payment process
    return this.initiatePayment(userId, ticketId, quantity);
  }

  async handlePaymentWebhook(payload: any) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: payload.order_id },
      relations: ['ticket', 'ticket.vendor'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction already processed');
    }

    if (payload.status === 'COMPLETED') {
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
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      throw new BadRequestException('Payment failed');
    }
  }

  private async initiatePayment(userId: string, ticketId: string, quantity: number) {
    const ticket = await this.ticketService.findOne(ticketId);
    const totalAmount = ticket.price * quantity;

    const transaction = this.transactionRepository.create({
      amount: totalAmount,
      type: 'purchase',
      status: 'pending',
      user: { id: userId },
      ticket,
    });

    await this.transactionRepository.save(transaction);

    const paymentResponse = await this.payChanguService.createPayment(
      totalAmount,
      transaction.id.toString()
    );

    return {
      transactionId: transaction.id,
      paymentUrl: paymentResponse.payment_url,
    };
  }

  async getUserPurchases(userId: string) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['ticket'],
    });
  }
} 