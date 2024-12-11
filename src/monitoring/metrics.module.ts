import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    MetricsService,
    makeCounterProvider({
      name: 'ticket_sales_total',
      help: 'Total number of ticket sales',
    }),
    makeHistogramProvider({
      name: 'transaction_duration_seconds',
      help: 'Transaction processing duration',
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {} 