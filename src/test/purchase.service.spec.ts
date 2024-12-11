import { Test } from '@nestjs/testing';
import { PurchaseService } from '../purchase/purchase.service';
import { createMock } from '@golevelup/ts-jest';

describe('PurchaseService', () => {
  let service: PurchaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMock<Repository<Transaction>>(),
        },
      ],
    }).compile();

    service = moduleRef.get<PurchaseService>(PurchaseService);
  });

  // Add your test cases
}); 