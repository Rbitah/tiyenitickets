import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWallet(@Request() req) {
    return this.walletService.getWallet(req.user.id);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  async withdrawToMobile(
    @Request() req,
    @Body() body: { amount: number; phoneNumber: string },
  ) {
    return this.walletService.withdrawToMobile(
      req.user.id,
      body.phoneNumber,
      body.amount,
    );
  }

  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  async getWithdrawalHistory(@Request() req) {
    return this.walletService.getWithdrawalHistory(req.user.id);
  }
} 