import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssignCashDto } from './dto/create-assign-cash.dto';
import { PrismaService } from 'src/prisma/prisma.service';

function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { gte: today, lt: tomorrow };
}

@Injectable()
export class AssignCashService {
  constructor(private prisma: PrismaService) {}
  async assignCashToTeller(createAssignCashDto: CreateAssignCashDto) {
    const { userId, currencyId, initialAmount } = createAssignCashDto;

    // Validate the input
    if (!userId || !initialAmount || !currencyId) {
      throw new BadRequestException('All fields are required');
    }
    if (initialAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Check if the teller exists and is a TELLER
    const teller = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!teller || teller.role !== 'TELLER') {
      throw new NotFoundException('Teller not found or not a teller');
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({ where: { id: currencyId } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    // Check if a balance already exists for this teller and currency

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingBalance = await this.prisma.tellerBalance.findFirst({
      where: {
        userId,
        currencyId,
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // less than tomorrow
        },
      },
    });
    if (existingBalance) {
      throw new ConflictException('Balance for this teller and currency already exists');
    }
    // Create the teller balance
    // Create the teller balance

    return this.prisma.tellerBalance.create({
      data: {
        userId,
        currencyId,
        initialAmount,
        currentAmount: initialAmount,
        createdAt: new Date(),
      },
    });
  }

  // View all teller balances

  async getAllTellerBalances(): Promise<any[]> {
    return this.prisma.tellerBalance.findMany({
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        currency: {
          select: {
            code: true,
            name: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // // Get teller balance by userId and currencyId

  async findAllTellerBalancesForToday(tellerId: number) {
    const todayRange = getTodayRange();

    if (!tellerId) {
      throw new BadRequestException('Teller ID is required');
    }

    return this.prisma.tellerBalance.findMany({
      where: {
        userId: tellerId,
        createdAt: todayRange,
      },
      include: {
        currency: true, // Include currency details (code, name, symbol)
        user: { select: { id: true, names: true, email: true } },
      },
      orderBy: { currency: { code: 'asc' } },
    });
  }
  //update teller balance
  async updateTellerBalance(id: number, createAssignCashDto: CreateAssignCashDto): Promise<any> {
    const { userId, currencyId, initialAmount } = createAssignCashDto;

    // Validate the input
    if (!userId || !currencyId || initialAmount === undefined) {
      throw new BadRequestException('User ID, Currency ID, and update amount are required');
    }
    if (initialAmount <= 0) {
      throw new BadRequestException('Update amount must be positive');
    }
    // Find the record by id, userId, currencyId, and today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tellerBalance = await this.prisma.tellerBalance.findFirst({
      where: {
        id,
        userId,
        currencyId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!tellerBalance) {
      throw new NotFoundException('Teller balance for today not found');
    }

    return this.prisma.tellerBalance.update({
      where: { id },
      data: {
        userId,
        currencyId,
        currentAmount: tellerBalance.currentAmount.plus(initialAmount),
        initialAmount: tellerBalance.initialAmount.plus(initialAmount),
      },
    });
  }
  //getTodayTellerBalance

  async getTodayTellerBalance(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.tellerBalance.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // less than tomorrow
        },
      },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        currency: {
          select: {
            code: true,
            name: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //find teller balance where it i will fetch inasssigned cash where user id equals to userId and today;
  //  * Finds the teller balance record for a specific user created today.
  //  * @param userId The ID of the user (teller)
  //  */
  async findTellerBalanceByUserIdAndToday(userId: number): Promise<any> {
    // Validate the input
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Get the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the start of tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the teller balance for the user for today
    const tellerBalance = await this.prisma.tellerBalance.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow, // less than the start of tomorrow
        },
      },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        currency: {
          select: {
            id: true, // It's good practice to also select the ID
            code: true,
            name: true,
            symbol: true,
          },
        },
      },
    });

    if (!tellerBalance) {
      throw new NotFoundException('No cash has been assigned to you for today.');
    }

    return tellerBalance;
  }
}
