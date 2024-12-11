import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column()
  availableQuantity: number;

  @Column()
  category: string;

  @ManyToOne(() => User, user => user.tickets)
  vendor: User;

  @OneToMany(() => Transaction, transaction => transaction.ticket)
  transactions: Transaction[];
} 