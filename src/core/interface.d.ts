// interface Address {
//   city: string;
//   street: string;
// }

interface Event {
  addresses: string[];
  start: moment.Moment;
  end: moment.Moment;
}

interface SubscriptionDTO {
  id: number;
  userId: number;
  address: string[];
  isActive: boolean;
  createdAt: number;
}

interface InsertSubscriptionDTO {
  userId: number;
  isActive: boolean;
}

// Current DB interface
interface DB {
  insertSubscription(dto: InsertSubscriptionDTO): Promise<Date>;

  getSubscriptionsUserIds(event: Event): Promise<number[]>;

  getSubscriptionAddress(userId: number): Promise<string>;

  searchAddresses(address: string): Promise<string[]>;

  setSubscriptionActive(userId: number, isActive: boolean): Promise<boolean>;

  setSubscriptionAddress(userId: number, address: string): Promise<boolean>;
}

interface BotCommandHandlers {
  start: BotStartHandler | { (): void };
  help: BotHelpHandler | { (): void };
  address: BotAddressHandler | { (): void };
  off: BotSubscriptionUpdateHandler | { (): void };
  renew: BotSubscriptionUpdateHandler | { (): void };
}
type BotStartHandler = (dto: InsertSubscriptionDTO) => Promise<void>;
type BotHelpHandler = (userId: number) => Promise<void>;
type BotSubscriptionUpdateHandler = (userId: number) => Promise<void>;
type BotAddressUpdateHandler = (
  userId: number,
  address: string,
) => Promise<void>;
type BotCommandHandler =
  | BotStartHandler
  | BotSubscriptionUpdateHandler
  | BotAddressUpdateHandler
  | BotHelpHandler;
type EventHandler = (event: Event) => Promise<void>;

interface Bot {
  setHandler<T extends keyof BotCommandHandlers>(
    command: T,
    handler: BotCommandHandlers[T],
  ): void;
  sendMessageToUser(userId: number, message: string): Promise<void>;
}

interface EventSource {
  onEvent(handler: EventHandler): void;
}

export {
  Bot,
  DB,
  EventSource,
  GitId,
  SubscriptionDTO,
  InsertSubscriptionDTO,
  InsertTgRequestResult,
  TgRequest,
  BotCommandHandlers,
  BotStartHandler,
  BotSubscriptionUpdateHandler,
  BotAddressUpdateHandler,
  BotHelpHandler,
  Event,
  EventHandler,
  BotCommandHandler,
};
