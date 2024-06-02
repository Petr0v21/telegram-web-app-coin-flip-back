import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Game, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from '../user/user.service';
import { GatewayService } from '../gateway/gateway.service';
import { EventType } from '../gateway/eventType.enum';

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly gatewayService: GatewayService,
  ) {}

  hasWon(percentWin?: number): boolean {
    return Math.random() < (percentWin ?? 0.25);
  }

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
  ): Promise<Game | null> {
    return this.prismaService.game.findUnique({
      where: gameWhereUniqueInput,
    });
  }

  async games(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.GameWhereUniqueInput;
    where?: Prisma.GameWhereInput;
    orderBy?: Prisma.GameOrderByWithRelationInput;
  }): Promise<Game[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.game.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        User: true,
      },
    });
  }

  async createGame(data: Prisma.GameCreateInput, user: User): Promise<Game> {
    const result = await this.prismaService.game.create({
      data,
    });
    await this.userService.updateBalance(data.bet, data.isWin, user);
    // this.gatewayService.emitEvent('test', {});
    return result;
  }

  async upsertGame(data: Prisma.GameUpsertArgs): Promise<Game> {
    return this.prismaService.game.upsert(data);
  }

  async updateGame(params: {
    where: Prisma.GameWhereUniqueInput;
    data: Prisma.GameUpdateInput;
  }): Promise<Game> {
    const { where, data } = params;
    return this.prismaService.game.update({
      data,
      where,
    });
  }

  async deleteGame(where: Prisma.GameWhereUniqueInput): Promise<Game> {
    return this.prismaService.game.delete({
      where,
    });
  }

  validatePlay(bet: number, balance: number) {
    if (bet <= 0) {
      throw new BadRequestException('Bet must be more than 0');
    }
    if (bet > balance) {
      throw new BadRequestException('Bet more than user balance');
    }
  }
}
