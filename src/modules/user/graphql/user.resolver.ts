import { Context, Resolver, Query } from '@nestjs/graphql';
import { UserService } from '../user.service';
import { ContextCustomType } from 'src/common/graphql/context';
import { UserDto } from './dto/User.dto';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserDto)
  getMe(@Context() { req: { user } }: ContextCustomType) {
    return user;
  }
}
