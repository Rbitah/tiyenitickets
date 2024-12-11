import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseService } from './purchase.service';

@ApiTags('purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createPurchase(
    @Request() req,
    @Body() body: { ticketId: string; quantity: number },
  ) {
    return this.purchaseService.createPurchase(
      req.user.id,
      body.ticketId,
      body.quantity,
    );
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user purchased tickets' })
  @ApiResponse({ status: 200, description: 'List of purchased tickets.' })
  async getUserPurchases(@Request() req) {
    return this.purchaseService.getUserPurchases(req.user.id);
  }
} 