import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './graphql/auth.resolver';

@Module({
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
