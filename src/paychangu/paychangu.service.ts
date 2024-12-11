import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PayoutRequest {
  mobile: string;
  amount: number;
  charge_id: string;
}

@Injectable()
export class PayChanguService {
  constructor(private configService: ConfigService) {}

  async createPayment(amount: number, orderId: string): Promise<any> {
    const apiKey = this.configService.get('PAYCHANGU_API_KEY');
    const merchantId = this.configService.get('PAYCHANGU_MERCHANT_ID');
    const baseUrl = this.configService.get('PAYCHANGU_BASE_URL');

    const payload = {
      merchant_id: merchantId,
      amount: amount,
      order_id: orderId,
      currency: 'TZS',
      redirect_url: this.configService.get('PAYCHANGU_REDIRECT_URL'),
      cancel_url: this.configService.get('PAYCHANGU_CANCEL_URL'),
      webhook_url: this.configService.get('PAYCHANGU_WEBHOOK_URL'),
    };

    try {
      const response = await axios.post(`${baseUrl}/api/payment/create`, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.payment_url) {
        throw new Error('PayChangu payment URL not received');
      }

      return response.data;
    } catch (error) {
      throw new Error(`PayChangu payment creation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId: string): Promise<any> {
    const apiKey = this.configService.get('PAYCHANGU_API_KEY');
    const baseUrl = this.configService.get('PAYCHANGU_BASE_URL');

    try {
      const response = await axios.get(`${baseUrl}/api/payment/verify/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`PayChangu payment verification failed: ${error.message}`);
    }
  }

  async initiatePayout(data: PayoutRequest): Promise<any> {
    const apiKey = this.configService.get('PAYCHANGU_API_KEY');
    const baseUrl = this.configService.get('PAYCHANGU_BASE_URL');

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-money/payouts/initialize`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`PayChangu payout failed: ${error.message}`);
    }
  }
} 