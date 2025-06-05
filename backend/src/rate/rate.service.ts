import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { CreateRateDto } from './dto/create-rate.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RateService {
  constructor(private prisma: PrismaService) {}
  // here create a rate of today
  async createRateExachange(createRateDto: CreateRateDto) {
    const { base, target, buyRate, sellRate, provider } = createRateDto;

    // 1. Validate required fields
    if (!base || !target || !buyRate || !sellRate || !provider) {
      throw new BadRequestException('All fields are required');
    }

    // 2. Validate currency codes (3 uppercase letters)
    const currencyRegex = /^[A-Z]{3}$/;
    if (!currencyRegex.test(base) || !currencyRegex.test(target)) {
      throw new BadRequestException('Currency codes must be 3 uppercase letters');
    }

    // 3. Validate rates
    if (buyRate <= 0 || sellRate <= 0) {
      throw new BadRequestException('Rates must be positive numbers');
    }

    // 4. Prevent duplicate for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const existing = await this.prisma.exchangeRate.findFirst({
      where: {
        base,
        target,
        provider,
        createdAt: {
          gte: today,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Rate for today already exists');
    }

    // Save to DB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.exchangeRate.create({
      data: {
        base,
        target,
        buyRate,
        sellRate,
        provider,
      },
    });
  }

  // view rates to every one

  // eslint-disable-next-line @typescript-eslint/require-await
  async getAllRates(): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.exchangeRate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //display all today rates
  // eslint-disable-next-line @typescript-eslint/require-await
  async getTodayRates(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.exchangeRate.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //update rate status be inactive
  async updateRateStatus(rateid: number, status: boolean) {
    // Validate ID
    if (!rateid || typeof rateid !== 'number') {
      throw new BadRequestException('Invalid rate ID');
    }

    // Find the rate
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rate = await this.prisma.exchangeRate.findUnique({
      where: { id: rateid },
    });

    if (!rate) {
      throw new BadRequestException('Rate not found');
    }

    // Update status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.exchangeRate.update({
      where: { id: rateid },
      data: { isActive: status },
    });
  }
}
