import { Telegraf } from 'telegraf';

import { Bot, BotCommandHandlers } from './core/interface';

const bot = new Telegraf(process.env.BOT_TOKEN || '');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const commandHandlers: BotCommandHandlers = {
  start: () => {
    console.log('/start handler not set');
  },
  off: () => {
    console.log('/off handler not set');
  },
  address: () => {
    console.log('/address handler not set');
  },
  renew: () => {
    console.log('/renew handler not set');
  },
  help: () => {
    console.log('/help handler not set');
  },
};

export async function BotService(): Promise<Bot> {
  bot.start(async (ctx) => {
    commandHandlers.start({
      userId: ctx.chat.id,
      isActive: true,
    });
  });
  bot.help((ctx) => {
    commandHandlers.help(ctx.chat.id);
  });
  bot.command('off', (ctx) => commandHandlers.off(ctx.chat.id));
  bot.command('renew', (ctx) => commandHandlers.renew(ctx.chat.id));
  bot.command('address', (ctx) => {
    const msg = ctx.message.text;
    commandHandlers.address(
      ctx.chat.id,
      msg.slice(msg.indexOf('/address') + '/address'.length + 1).trim(),
    );
  });
  bot.launch().catch((e) => console.log(e));

  return {
    setHandler,
    sendMessageToUser,
  };
}

function setHandler<T extends keyof BotCommandHandlers>(
  command: T,
  handler: BotCommandHandlers[T],
): void {
  commandHandlers[command] = handler;
}

async function sendMessageToUser(
  chatId: number,
  message: string,
): Promise<void> {
  await bot.telegram.sendMessage(chatId, message);
}
