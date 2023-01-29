import { BotService } from './bot';
import { SubscriptionManager } from './core';
import { DBService } from './db';
import { EventSourceService } from './eventSource';

(async function main(): Promise<void> {
  SubscriptionManager({
    db: await DBService(),
    bot: await BotService(),
    eventSource: await EventSourceService(),
  });
})();
