import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  tellerId: number;

  @IsNotEmpty()
  @IsNumber()
  fromCurrencyId: number;

  @IsNotEmpty()
  @IsNumber()
  toCurrencyId: number;

  @IsNotEmpty()
  @IsNumber()
  fromAmount: number;

  // @IsNotEmpty()
  // @IsNumber()
  // toAmount: number;

  // @IsNotEmpty()
  // @IsNumber()
  // rate: number; // The rate used for this transaction

  @IsNotEmpty()
  @IsNumber()
  exchangeRateId: number; // Reference to ExchangeRate

  // Optional: comment or description
  comment?: string;
}
