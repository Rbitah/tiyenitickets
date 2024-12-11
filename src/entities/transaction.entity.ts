import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from './ticket.entity';
import { Wallet } from './wallet.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  WITHDRAWAL = 'withdrawal',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ nullable: true })
  referenceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @ManyToOne(() => Ticket, ticket => ticket.transactions)
  ticket: Ticket;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;
} 