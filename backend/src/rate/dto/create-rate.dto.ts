import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export class CreateRateDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['EUR', 'USD', 'RWF', 'GBP'], {
    message: 'Base currency must be EUR, USD, RWF, or GBP',
  })
  base: string;

  @IsNotEmpty()
  @IsString()
  target: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Buy rate must be a number' })
  @IsPositive({ message: 'Buy rate must be positive' })
  @Max(10000, { message: 'Buy rate cannot exceed 10000' })
  buyRate: number;

  @IsNotEmpty()
  @IsNumber({}, { message: 'sellRate must be a number' })
  @IsPositive({ message: 'Buy rate must be positive' })
  @Max(10000, { message: 'Buy rate cannot exceed 10000' })
  sellRate: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['fixer', 'alpha-vantage', 'manual', 'central-bank'], {
    message: 'Provider must be a valid source',
  })
  provider: string;
}
