import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { EventType } from '../gateway/eventType.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gatewayService: GatewayService,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        games: true,
      },
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({
      data,
    });
  }

  async upsertUser(data: Prisma.UserUpsertArgs): Promise<User> {
    return this.prismaService.user.upsert(data);
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prismaService.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prismaService.user.delete({
      where,
    });
  }

  async checkBalance(amountToCheck: number, userId: string) {
    const user = await this.user({ id: userId });
    return user && user.balance >= amountToCheck;
  }

  async updateBalance(amount: number, isRise: boolean, user: User) {
    // this.gatewayService.emitSocketEvent(EventType.UpdateUserBalance + user.id);
    await this.updateUser({
      where: {
        id: user.id,
      },
      data: {
        balance: isRise ? user.balance + amount : user.balance - amount,
      },
    });
  }
}
