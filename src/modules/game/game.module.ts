import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameResolver } from './graphql/game.resolver';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [UserModule, PrismaModule, GatewayModule],
  providers: [GameService, GameResolver],
})
export class GameModule {}
