import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { GameService } from '../game.service';
import { SuccessOutput } from 'src/common/graphql/output/SuccessOutput';
import { PlayArgs } from './args/PlayArgs';
import { ContextCustomType } from 'src/common/graphql/context';
import { Game } from '@prisma/client';
import { GameDto } from './dto/Game.dto';
import { GetHistoryArgs } from './args/getHistoryArgs';

@Resolver('Game')
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

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
    @Args() { bet, side }: PlayArgs,
    @Context() { req: { user } }: ContextCustomType,
  ): Promise<SuccessOutput> {
    this.gameService.validatePlay(bet, user.balance);
    const isWin = this.gameService.hasWon(Number(process.env.PERCENT_WIN));
    await this.gameService.createGame(
      {
        bet,
        isWin,
        side,
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
