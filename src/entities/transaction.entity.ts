import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from './ticket.entity';
import { Wallet } from './wallet.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  status: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  paypalTransactionId: string;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @ManyToOne(() => Ticket, ticket => ticket.transactions)
  ticket: Ticket;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;
} 