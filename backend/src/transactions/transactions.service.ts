/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

// UTC-safe function to get today's date range. This prevents timezone bugs.
function getTodayRangeUTC() {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return { gte: today, lt: tomorrow };
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // ... create() method remains the same ...
  async create(createTransactionDto: CreateTransactionDto) {
    const { tellerId, fromCurrencyId, toCurrencyId, fromAmount, exchangeRateId } = createTransactionDto;

    if (!tellerId || !fromCurrencyId || !toCurrencyId || !fromAmount || !exchangeRateId || fromAmount <= 0) {
      throw new BadRequestException('Missing or invalid required fields. Amount must be positive.');
    }
    const teller = await this.prisma.users.findUnique({ where: { id: tellerId, role: 'TELLER' } });
    if (!teller) {
      throw new NotFoundException('Teller not found.');
    }
    if (fromCurrencyId === toCurrencyId) {
      throw new BadRequestException('Cannot exchange the same currency.');
    }
    const fromCurrency = await this.prisma.currency.findUnique({ where: { id: fromCurrencyId } });
    const toCurrency = await this.prisma.currency.findUnique({ where: { id: toCurrencyId } });
    if (!fromCurrency || !toCurrency) {
      throw new NotFoundException('One of the currencies was not found.');
    }

    const exchangeRate = await this.prisma.exchangeRate.findUnique({ where: { id: exchangeRateId } });
    if (!exchangeRate || !exchangeRate.isActive) {
      throw new NotFoundException('Active exchange rate not found.');
    }
    const buyRate = Number(exchangeRate.buyRate);
    const sellRate = Number(exchangeRate.sellRate);
    const spread = sellRate - buyRate;

    let rate: number;
    let toAmount: number;
    let profit: number;
    let amountOfBaseCurrency: number;

    if (fromCurrency.code === exchangeRate.base && toCurrency.code === exchangeRate.target) {
      rate = buyRate;
      toAmount = fromAmount * rate;
      amountOfBaseCurrency = fromAmount;
    } 
    else if (fromCurrency.code === exchangeRate.target && toCurrency.code === exchangeRate.base) {
      rate = sellRate;
      toAmount = fromAmount / rate;
      amountOfBaseCurrency = toAmount;
    } 
    else {
      throw new BadRequestException(`The selected rate for ${exchangeRate.base}/${exchangeRate.target} does not apply to a ${fromCurrency.code}/${toCurrency.code} exchange.`);
    }
    
    profit = amountOfBaseCurrency * spread;
    toAmount = parseFloat(toAmount.toFixed(4));
    profit = parseFloat(profit.toFixed(4));

    const todayRange = getTodayRangeUTC();
    const fromBalance = await this.prisma.tellerBalance.findFirst({
      where: { userId: tellerId, currencyId: fromCurrencyId, createdAt: todayRange },
    });
    if (!fromBalance || Number(fromBalance.currentAmount) < fromAmount) {
      throw new BadRequestException(`Insufficient balance for ${fromCurrency.code}. Current: ${fromBalance?.currentAmount || 0}, Required: ${fromAmount}`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.tellerBalance.update({
        where: { id: fromBalance.id },
        data: { currentAmount: { decrement: fromAmount } },
      });

      const toBalance = await tx.tellerBalance.findFirst({
        where: { userId: tellerId, currencyId: toCurrencyId, createdAt: todayRange },
      });
      if (toBalance) {
        await tx.tellerBalance.update({
          where: { id: toBalance.id },
          data: { currentAmount: { increment: toAmount } },
        });
      } else {
        await tx.tellerBalance.create({
          data: {
            userId: tellerId,
            currencyId: toCurrencyId,
            initialAmount: 0,
            currentAmount: toAmount,
          },
        });
      }

      return tx.transaction.create({
        data: {
          tellerId,
          fromCurrencyId,
          toCurrencyId,
          fromAmount,
          toAmount,
          rate: rate,
          profit,
          exchangeRateId,
        },
      });
    });
  }

  // RE-USED for teller-specific endpoints
  async getTodayBalances(tellerId: number) {
    return this.prisma.tellerBalance.findMany({
      where: { userId: tellerId, createdAt: getTodayRangeUTC() },
      include: { currency: true },
    });
  }

  // RE-USED for both teller and admin endpoints
  async getTodayTransactions(tellerId: number) {
    return this.prisma.transaction.findMany({
      where: {
        tellerId,
        createdAt: getTodayRangeUTC(),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });
  }

  // RE-USED for both teller and admin endpoints
  async getTodayProfit(tellerId: number) {
    const { _sum } = await this.prisma.transaction.aggregate({
      where: {
        tellerId,
        createdAt: getTodayRangeUTC(),
      },
      _sum: { profit: true },
    });
    return { tellerId, totalProfit: _sum.profit || 0 };
  }

  // --- NEW: Method for Admin to get ALL transactions for today ---
  async getAllTellersTodayTransactions() {
    return this.prisma.transaction.findMany({
      where: {
        createdAt: getTodayRangeUTC(), // No tellerId filter, so it gets all
      },
      orderBy: { createdAt: 'desc' },
      include: {
        // Include teller info so the admin knows who made the transaction
        Users: {
          select: {
            id: true,
            names: true,
          }
        },
        fromCurrency: true,
        toCurrency: true,
      },
    });
  }
  
  // RE-USED for admin endpoint
  async getAllTellersTodayProfit() {
    const profits = await this.prisma.transaction.groupBy({
      by: ['tellerId'],
      where: { createdAt: getTodayRangeUTC() },
      _sum: { profit: true },
    });
    return Promise.all(
      profits.map(async (item) => {
        const teller = await this.prisma.users.findUnique({
          where: { id: item.tellerId },
          select: { names: true, email: true },
        });
        return {
          tellerId: item.tellerId,
          tellerName: teller?.names ?? 'N/A',
          profit: item._sum.profit || 0,
        };
      }),
    );
  }
}