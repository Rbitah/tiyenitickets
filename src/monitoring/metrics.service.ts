import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('ticket_sales_total')
    private readonly ticketSalesCounter: Counter<string>,
    @InjectMetric('transaction_duration_seconds')
    private readonly transactionDurationHistogram: Histogram<string>
  ) {}

  incrementTicketSales() {
    this.ticketSalesCounter.inc();
  }

  recordTransactionDuration(seconds: number) {
    this.transactionDurationHistogram.observe(seconds);
  }
} 