import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PurchaseService } from './purchase.service';

@Processor('purchases')
export class PurchaseProcessor {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Process('payment-webhook')
  async handlePaymentWebhook(job: Job) {
    return this.purchaseService.handlePaymentWebhook(job.data);
  }
} 