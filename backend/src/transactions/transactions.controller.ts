/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('api/v1/transactions')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Apply security to the whole controller
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ===================================================================
  // == TELLER-SPECIFIC ROUTES (for the currently logged-in teller)
  // ===================================================================

  @Post('create')
  @Roles('TELLER')
  async create(@Body() createDto: CreateTransactionDto, @Req() req) {
    const tellerId = req.user.id;
    if (!tellerId) {
      throw new BadRequestException('User ID not found in token.');
    }
    const secureDto = { ...createDto, tellerId };
    return this.transactionsService.create(secureDto);
  }

  @Get('my-today-balances')
  @Roles('TELLER')
  getMyAppTodayBalances(@Req() req) {
    const tellerId = req.user.id;
    return this.transactionsService.getTodayBalances(tellerId);
  }

  @Get('my-today-transactions')
  @Roles('TELLER')
  getMyAppTodayTransactions(@Req() req) {
    const tellerId = req.user.id;
    return this.transactionsService.getTodayTransactions(tellerId);
  }

  @Get('my-today-profit')
  @Roles('TELLER')
  getMyAppTodayProfit(@Req() req) {
    const tellerId = req.user.id;
    return this.transactionsService.getTodayProfit(tellerId);
  }

  // ===================================================================
  // == ADMIN-SPECIFIC ROUTES (for managing and viewing all tellers)
  // ===================================================================

  /**
   * GET /api/v1/transactions/admin/transactions/today/all
   * (Admin only) Gets today's transactions for ALL tellers.
   */
  @Get('admin/transactions/today/all')
  @Roles('ADMIN')
  getAllTellersTodayTransactionsForAdmin() {
    return this.transactionsService.getAllTellersTodayTransactions();
  }

  /**
   * GET /api/v1/transactions/admin/transactions/today/:tellerId
   * (Admin only) Gets today's transactions for a SPECIFIC teller.
   */
  @Get('admin/transactions/today/:tellerId')
  @Roles('ADMIN')
  getTellerTransactionsForAdmin(@Param('tellerId', ParseIntPipe) tellerId: number) {
    // We re-use the same service method here
    return this.transactionsService.getTodayTransactions(tellerId);
  }

  /**
   * GET /api/v1/transactions/admin/profit/today/all
   * (Admin only) Gets today's profit for ALL tellers.
   */
  @Get('admin/profit/today/all')
  @Roles('ADMIN')
  getAllTellersTodayProfitForAdmin() {
    return this.transactionsService.getAllTellersTodayProfit();
  }

  /**
   * GET /api/v1/transactions/admin/profit/today/:tellerId
   * (Admin only) Gets today's profit for a SPECIFIC teller.
   */
  @Get('admin/profit/today/:tellerId')
  @Roles('ADMIN')
  getTellerProfitForAdmin(@Param('tellerId', ParseIntPipe) tellerId: number) {
    // We re-use the same service method here
    return this.transactionsService.getTodayProfit(tellerId);
  }
}
