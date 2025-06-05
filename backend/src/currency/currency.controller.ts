import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Put,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('api/v1/currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('add')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.createNewCurrency(createCurrencyDto);
  }
  @Get('view')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAllCurrencies() {
    return this.currencyService.getCurrencies();
  }
  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  update(@Body() updateCurrencyDto: CreateCurrencyDto, @Param('id') currencyId: string) {
    const id = parseInt(currencyId, 10); // <-- Convert to number
    if (isNaN(id)) {
      throw new BadRequestException('Invalid Currency ID');
    }
    return this.currencyService.updateCurrency(id, updateCurrencyDto);
  }
  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    const currencyId = parseInt(id, 10); // <-- Convert to number
    if (isNaN(currencyId)) {
      throw new BadRequestException('Invalid Currency ID');
    }

    return this.currencyService.deleteCurrency(currencyId);
  }
  @Get('view/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOneCurrency(@Body('id') id: string) {
    const currencyId = parseInt(id, 10); // <-- Convert to number
    if (isNaN(currencyId)) {
      throw new BadRequestException('Invalid Currency ID');
    }
    return this.currencyService.getCurrencyById(currencyId);
  }
}
