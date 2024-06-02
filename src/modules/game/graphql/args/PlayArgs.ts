import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class PlayArgs {
  @Field()
  bet: number;
}
