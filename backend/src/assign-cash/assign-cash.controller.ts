/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  BadRequestException,
  Param,
  Req,
} from '@nestjs/common';
import { AssignCashService } from './assign-cash.service';
import { CreateAssignCashDto } from './dto/create-assign-cash.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('api/v1/teller')
export class AssignCashController {
  constructor(private readonly assignCashService: AssignCashService) {}

  @Post('assign-cash')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() createAssignCashDto: CreateAssignCashDto) {
    return this.assignCashService.assignCashToTeller(createAssignCashDto);
  }
  @Get('balance')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  getTellerBalance() {
    return this.assignCashService.getAllTellerBalances();
  }

  //find teller balance where it i will fetch inasssigned cash where user id equals to userId and today;

  /**
   * Gets the balance assigned today for the currently authenticated TELLER.
   * The user ID is securely retrieved from the JWT token.
   */
  @Get('my-balance/today') // 1. More secure and descriptive route. No userId parameter.
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 2. Use 'jwt' (lowercase) which is the standard strategy name.
  @Roles('TELLER')
  getTellerTodayBalance(@Req() req) {
    // 3. Inject the request object to access the user.

    // 4. The AuthGuard attaches the JWT payload to `req.user`.
    // The property might be `id` or `sub` depending on your JWT strategy payload.
    const userId = req.user.id;

    // A small validation check
    if (!userId) {
      throw new BadRequestException('User identifier not found in token.');
    }

    // 5. Call the service with the authenticated user's ID.
    return this.assignCashService.findTellerBalanceByUserIdAndToday(Number(userId));
  }

  @Get('balance/today')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  getTodayTellerBalance() {
    return this.assignCashService.getTodayTellerBalance();
  }

  //update the teller balance
  @Put(':id/update-balance')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateTellerBalance(
    @Body() updateTellerBalanceDto: CreateAssignCashDto,
    @Param('id') assignId: string,
  ) {
    const id = parseInt(assignId, 10); // <-- Convert to number
    if (isNaN(id)) {
      throw new BadRequestException('Invalid Assign Cash ID');
    }
    return this.assignCashService.updateTellerBalance(id, updateTellerBalanceDto);
  }
}
