import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role } from '../../generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // <-- Inject JwtService
  ) {}

  async registerUser(createUserDto: CreateAuthDto): Promise<{ message: string; user: any }> {
    const { names, email, phone, password, role } = createUserDto;

    const existingUser = await this.prisma.users.findMany({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser.length > 0) {
      throw new ConflictException('Email or phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.users.create({
        data: {
          names,
          email,
          phone,
          password: hashedPassword,
          role: role || Role.TELLER,
          status: AccountStatus.ACTIVE,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: 'Account created successfully',
        user: userWithoutPassword,
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  // admin update teller
  async updateTellerStatus(userId: number, status: AccountStatus) {
    // Validate the status
    if (!Object.values(AccountStatus).includes(status)) {
      throw new BadRequestException('Invalid status provided');
    }
    // Check if the user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: { status },
      });

      return {
        message: 'Teller account status updated successfully',
        user: updatedUser,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user status');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ message: string; token: string; user: any }> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('Your account is inactive. Please contact support.');
    }

    const payload = { id: user.id, role: user.role };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'abcd123',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
      },
    };
  }
  // Validate user by token (for protected routes)
  async validateUser(payload: { id: number; role: string }) {
    const user = await this.prisma.users.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  //view all users
  async getAllUsers() {
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
        names: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return users;
  }
}
