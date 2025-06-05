import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RateService } from './rate.service';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CreateRateDto } from './dto/create-rate.dto';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('api/v1/rate')
export class RateController {
  constructor(private readonly rateService: RateService) {}
  //admin add rates here changes here
  @Post('add')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async registerExchange(@Body() createRateDto: CreateRateDto) {
    // Optionally, you can check req.user here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rateService.createRateExachange(createRateDto);
  }

  // view rate to evry one
  @Get('view')
  async viewExchange() {
    // Optionally, you can check req.user here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.rateService.getAllRates();
  }

  //display today rates
  @Get('today')
  async todayExchange() {
    // Optionally, you can check req.user here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.rateService.getTodayRates();
  }

  //update rate status
  @Put(':rateid/update-status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateRateStatus(
    @Param('rateid') rateid: string, // <-- Accept as string
    @Body('status') status: boolean,
  ) {
    // Optionally, you can check req.user here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    const id = parseInt(rateid, 10); // <-- Convert to number
    if (isNaN(id)) {
      throw new BadRequestException('Invalid rate ID');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.rateService.updateRateStatus(id, status);
  }
}
