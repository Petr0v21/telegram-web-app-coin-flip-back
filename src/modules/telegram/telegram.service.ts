import { Inject, Injectable } from '@nestjs/common';
import { Api, Bot, Context, RawApi } from 'grammy';
import { configuration } from './telegram.config';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class TelegramService {
  constructor(
    @Inject('BOT') private readonly bot: Bot<Context, Api<RawApi>>,
    @Inject('BOT_TOKEN') private readonly bot_token: string,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {
    configuration(this.bot);
    this.addListeners(bot);
  }
  //TODO
  private async getUserAvatar(ctx: Context): Promise<string | undefined> {
    try {
      const photo = (await ctx.getUserProfilePhotos()).photos[0][2];
      if (!photo) {
        return;
      }
      const photoFile = await this.bot.api.getFile(photo.file_id);

      const fileResponse = await fetch(
        `https://api.telegram.org/file/bot${this.bot_token}/${photoFile.file_path}`,
      ).then((res) => res.arrayBuffer());
      return await this.s3Service.uploadFile(
        Buffer.from(new Uint8Array(fileResponse)),
        ctx.from.id.toString(),
      );
    } catch (err) {
      console.error('GetUserAvatar ', err);
    }
  }

  addListeners(bot: Bot<Context, Api<RawApi>>) {
    this.bot.command('start', async (ctx) => {
      if (ctx.from.is_bot) {
        return;
      }
      const avatarKey = await this.getUserAvatar(ctx);
      await this.userService.upsertUser({
        where: {
          telegramId: ctx.from.id.toString(),
        },
        create: {
          telegramId: ctx.from.id.toString(),
          userName: ctx.from.username,
          fullName: `${ctx.from.first_name}${
            ctx.from.last_name ? ' ' + ctx.from.last_name : ''
          }`,
          avatar:
            'https://shakita-hookah.s3.eu-central-1.amazonaws.com/' + avatarKey,
          balance: 100,
        },
        update: {
          userName: ctx.from.username,
          fullName: `${ctx.from.first_name}${
            ctx.from.last_name ? ' ' + ctx.from.last_name : ''
          }`,
          avatar:
            'https://shakita-hookah.s3.eu-central-1.amazonaws.com/' + avatarKey,
        },
      });
      await ctx.reply(`Welcome to TEST BOT - telegram web app!`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Play',
                web_app: {
                  url: 'https://telegram-web-app-livid.vercel.app/',
                },
              },
            ],
            [
              {
                text: 'Info',
                callback_data: 'info',
              },
            ],
          ],
        },
      });
    });
    this.bot.command('info', (ctx) => ctx.reply('Info!'));
    this.bot.command('game', (ctx) =>
      ctx.reply('Game', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Play',
                web_app: {
                  url: 'https://telegram-web-app-livid.vercel.app/',
                },
              },
            ],
          ],
        },
      }),
    );

    bot.on('callback_query:data', async (ctx) => {
      if (ctx.callbackQuery.data === 'info') {
        ctx.reply('Info');
      }
      return await ctx.answerCallbackQuery();
    });
  }

  initWebhook(url: string): void {
    this.bot.api.setWebhook(`${url}/webhook`);
    this.bot.init();
    console.log('Bot inited!!!');
  }

  async handleUpdate(update: any): Promise<void> {
    await this.bot.handleUpdate(update);
  }
}
