import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/modules/user/graphql/dto/User.dto';

@ObjectType()
export class GameDto {
  @Field()
  id: string;

  @Field()
  isWin: boolean;

  @Field()
  bet: number;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  User: UserDto;
}
