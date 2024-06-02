import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './graphql/user.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
