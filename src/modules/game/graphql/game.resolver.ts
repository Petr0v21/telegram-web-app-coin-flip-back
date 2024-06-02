import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { GameService } from '../game.service';
import { SuccessOutput } from 'src/common/graphql/output/SuccessOutput';
import { PlayArgs } from './args/PlayArgs';
import { ContextCustomType } from 'src/common/graphql/context';
import { Game } from '@prisma/client';
import { GameDto } from './dto/Game.dto';
import { GetHistoryArgs } from './args/getHistoryArgs';
import { GatewayService } from 'src/modules/gateway/gateway.service';

@Resolver('Game')
export class GameResolver {
  constructor(
    private readonly gameService: GameService,
    private readonly gatewayService: GatewayService,
  ) {}

  @Query(() => [GameDto])
  async getHistory(@Args() { skip, take }: GetHistoryArgs): Promise<Game[]> {
    return await this.gameService.games({
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  @Mutation(() => SuccessOutput)
  async play(
    @Args() args: PlayArgs,
    @Context() { req: { user } }: ContextCustomType,
  ): Promise<SuccessOutput> {
    this.gatewayService.emitCustomEvent('customEvent', {
      message: 'Hello from server',
    });
    this.gameService.validatePlay(args.bet, user.balance);
    const isWin = this.gameService.hasWon(Number(process.env.PERCENT_WIN));
    await this.gameService.createGame(
      {
        bet: args.bet,
        isWin,
        User: {
          connect: {
            id: user.id,
          },
        },
      },
      user,
    );
    return { success: isWin };
  }
}
