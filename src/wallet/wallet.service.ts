import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { PayChanguService } from '../paychangu/paychangu.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly payChanguService: PayChanguService,
  ) {}

  private generateUniqueTransactionReference(): string {
    return uuidv4();
  }

  async withdrawToMobile(userId: string, phoneNumber: string, amount: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) {
      throw new UnauthorizedException('No wallet found.');
    }

    if (wallet.balance < amount) {
      throw new UnauthorizedException('Insufficient wallet balance.');
    }

    const chargeId = this.generateUniqueTransactionReference();

    try {
      const response = await this.payChanguService.initiatePayout({
        mobile: phoneNumber,
        amount,
        charge_id: chargeId,
      });

      if (response.status === 'success') {
        // Create withdrawal transaction
        const transaction = this.transactionRepository.create({
          amount,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          user,
          wallet,
          referenceId: chargeId,
        });
        await this.transactionRepository.save(transaction);

        // Update wallet balance
        wallet.balance -= amount;
        await this.walletRepository.save(wallet);

        return response;
      } else {
        throw new HttpException(
          'Failed to initiate mobile money payout.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error initiating payout:', error.response?.data || error.message);
      throw new HttpException(
        'An error occurred while processing the payout.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWithdrawalHistory(userId: string) {
    const withdrawals = await this.transactionRepository.find({
      where: { user: { id: userId }, type: TransactionType.WITHDRAWAL },
      relations: ['user'],
    });

    return withdrawals;
  }

  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
      relations: ['transactions'],
    });
    if (!wallet) {
      throw new UnauthorizedException('Wallet not found.');
    }
    return wallet;
  }

  async updateWalletBalance(walletId: string, amount: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new UnauthorizedException('Wallet not found.');
    }
    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }
}
