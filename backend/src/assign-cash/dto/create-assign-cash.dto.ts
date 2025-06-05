import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateAssignCashDto {
  @IsNotEmpty()
  @IsNumber()
  @IsInt({ message: 'User ID must be an integer.' })
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsInt({ message: 'Currency ID must be an integer.' })
  currencyId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Initial amount must be a positive number.' })
  initialAmount: number;
}
