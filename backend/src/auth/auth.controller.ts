import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { AccountStatus } from 'generated/prisma';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // admin  create an new account of teller

  @Post('signup')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async registerUser(@Body() createUserDto: CreateAuthDto) {
    // Optionally, you can check req.user here
    return this.authService.registerUser(createUserDto);
  }
  // admin update teller status account
  @Put(':userId/status')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async adminUpdateUserStatus(
    @Param('userId') userId: string,
    @Body('status') status: AccountStatus,
  ) {
    {
      const userIdNumber = parseInt(userId, 10);
      if (isNaN(userIdNumber)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }

      return this.authService.updateTellerStatus(userIdNumber, status);
    }
  }

  // user login here
  @Post('signin')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return await this.authService.login(email, password);
  }

  //view all users
  @Get('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
}
