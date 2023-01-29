import {
  Bot,
  DB,
  Event,
  EventSource,
  InsertSubscriptionDTO,
} from './interface';

let db: DB, bot: Bot, eventSource: EventSource;
const messages = {
  help: `
    Доступные команды:
    /off – деактивировать подписку, не получать уведомления об отключениях
    /renew – сделать подписку обратно активной
    /address – адрес с сайта water.gov.ge на грузинском; например, "/address ქუთაისი განჯის ქ."
    /help – показать это сообщение
  `.replaceAll('    ', ''),
};

export function SubscriptionManager(services: {
  db: DB;
  bot: Bot;
  eventSource: EventSource;
}): void {
  bot = services.bot || bot;
  db = services.db || db;
  eventSource = services.eventSource || eventSource;
  bot.setHandler('start', subscribeUser);
  bot.setHandler('help', sendHelp);
  bot.setHandler('off', unsubscribeUser);
  bot.setHandler('address', handleAddress);
  bot.setHandler('renew', resubscribeUser);
  eventSource.onEvent(notifySubscribers);
}

const subscribeUser = async (dto: InsertSubscriptionDTO): Promise<void> => {
  await db
    .insertSubscription({
      userId: dto.userId,
      isActive: true,
    })
    .catch((e) => console.log(e));
  await bot.sendMessageToUser(
    dto.userId,
    `Привет! Вот мои команды\n${messages.help}`,
  );
};

const sendHelp = async (userId: number): Promise<void> => {
  await bot.sendMessageToUser(userId, messages.help);
};

const unsubscribeUser = async (userId: number): Promise<void> => {
  await db.setSubscriptionActive(userId, false).catch((e) => console.log(e));
  await bot.sendMessageToUser(userId, 'Подписка приостановлена');
};

const handleAddress = async (
  userId: number,
  address: string,
): Promise<void> => {
  if (!address.length) {
    const address = await db.getSubscriptionAddress(userId).catch((e) => {
      console.log(e);
      return '';
    });
    const message = address.length
      ? `Вы будете получать уведомления об отключениях по адресу ${address}`
      : 'У вас не установлен адрес';
    return bot.sendMessageToUser(userId, message);
  }
  const addresses = await db.searchAddresses(address).catch((e) => {
    console.log(e);
    return [];
  });
  console.log({ addresses });
  if (!addresses.length)
    return bot.sendMessageToUser(
      userId,
      'Указанный адрес не найден, либо произошла другая ошибка',
    );
  await db.setSubscriptionAddress(userId, address);
  await bot.sendMessageToUser(userId, makeAddressResultMessage(addresses));
};

const resubscribeUser = async (userId: number): Promise<void> => {
  await db.setSubscriptionActive(userId, true).catch((e) => console.log(e));
  await bot.sendMessageToUser(userId, 'Подписка возобновлена');
};

const notifySubscribers = async (event: Event): Promise<void> => {
  const userIds = await db.getSubscriptionsUserIds(event).catch((e) => {
    console.log(e);
    return [];
  });
  const startFormatted = event.start.format('DD/MM/YYYY HH:mm:ss');
  const endFormatted = event.end.format('DD/MM/YYYY HH:mm:ss');
  const notificationMessage = `По вашему адресу планируется отключение в период с ${startFormatted} по ${endFormatted}`;
  await Promise.all(
    userIds.map((id) => bot.sendMessageToUser(id, notificationMessage)),
  );
};

const makeAddressResultMessage = (addresses: string[]): string => {
  const messageLines = [
    'Указанный адрес теперь используется для фильтрации объявлений',
  ];
  messageLines.push(
    `По указанному адресу найдено адресов: ${addresses.length}`,
    '',
  );
  const addressesDisplayed = 3;
  for (let i = 0; i !== addressesDisplayed && i !== addresses.length; i++) {
    messageLines.push(`${addresses[i]};`);
  }
  if (addressesDisplayed < addresses.length) messageLines.push('...');
  messageLines.push('');
  return messageLines.join('\n');
};
