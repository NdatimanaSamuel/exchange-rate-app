import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}
  //create a new currency
  // This method will handle the logic for creating a new currency
  async createNewCurrency(createCurrencyDto: CreateCurrencyDto) {
    const { code, name, symbol } = createCurrencyDto;
    //validate the input
    if (!code || !name || !symbol) {
      throw new BadRequestException('All fields are required');
    }
    //check if currency already exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const existingCurrency = this.prisma.currency.findMany({
      where: {
        OR: [{ code }, { symbol }],
      },
    });
    if ((await existingCurrency).length > 0) {
      throw new ConflictException('Currency with this code, or symbol already exists');
    }
    //create a new currency
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const newCurrency = await this.prisma.currency.create({
      data: {
        code,
        name,
        symbol,
      },
    });
    //return the new currency
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return newCurrency;
    //add message confrim data is added
  }

  //view all currencies as admin & teller
  async getCurrencies(): Promise<any[]> {
    return this.prisma.currency.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //update a currency
  async updateCurrency(id: number, updateCurrencyDto: CreateCurrencyDto) {
    const { code, name, symbol } = updateCurrencyDto;
    //validate the input
    if (!code || !name || !symbol) {
      throw new BadRequestException('All fields are required');
    }
    //check if currency exists
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { id },
    });
    if (!existingCurrency) {
      throw new BadRequestException('Currency not found');
    }
    //update the currency
    return this.prisma.currency.update({
      where: { id },
      data: {
        code,
        name,
        symbol,
      },
    });
  }

  //delete a currency
  async deleteCurrency(id: number) {
    //check if currency exists
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { id },
    });
    if (!existingCurrency) {
      throw new BadRequestException('Currency not found');
    }
    //delete the currency
    return this.prisma.currency.delete({
      where: { id },
    });
  }
  //get a currency by id
  async getCurrencyById(id: number) {
    //check if currency exists
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { id },
    });
    if (!existingCurrency) {
      throw new BadRequestException('Currency not found');
    }
    //return the currency
    return existingCurrency;
  }
}
