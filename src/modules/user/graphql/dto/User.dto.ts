import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  telegramId: string;

  @Field({ nullable: true })
  userName?: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  balance: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
