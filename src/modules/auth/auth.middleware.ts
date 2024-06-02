import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { SelectionNode, parse, visit } from 'graphql';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { ContextCustomRequestType } from 'src/common/graphql/context/ContextRequestType';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  private supportMethods: string[] = ['__schema'];

  async use(req: ContextCustomRequestType, res: Response, next: NextFunction) {
    if (req.body?.query) {
      const ast = parse(req.body.query);

      let methodName: string | undefined;

      visit(ast, {
        OperationDefinition(node) {
          methodName = (
            node.selectionSet.selections[0] as SelectionNode & {
              name: { value: string };
            }
          ).name.value;
        },
      });

      if (!methodName) {
        throw new BadRequestException();
      }

      if (this.supportMethods.includes(methodName)) {
        return next();
      }

      const query = req.headers['key-token'].toString();
      if (!query) {
        throw new UnauthorizedException('Query not provided');
      }

      const validateStatus = this.authService.validateTelegramHash(
        process.env.BOT_TOKEN,
        query,
      );

      if (!validateStatus.status) {
        throw new UnauthorizedException('Invalid provided Query');
      }

      const user = await this.userService.user({
        telegramId: validateStatus.userId,
      });

      if (!user) {
        throw new UnauthorizedException('This telegram user not exist in db');
      }

      req.user = user;
      return next();
    }

    return next();
  }
}
