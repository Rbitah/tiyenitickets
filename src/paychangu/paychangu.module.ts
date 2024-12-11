import { Module } from '@nestjs/common';
import { PayChanguService } from './paychangu.service';

@Module({
  providers: [PayChanguService],
  exports: [PayChanguService],
})
export class PayChanguModule {} 