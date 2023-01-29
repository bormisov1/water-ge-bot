import * as fs from 'fs';

import { DB, Event, InsertSubscriptionDTO } from '../core/interface';

import { AppDataSource } from './data-source';
import { Subscription } from './entity/Subscription';

const ADDRESSES_FILE_PATH = 'addresses.txt';
let savedAddresses: string[];

export async function DBService(): Promise<DB> {
  await AppDataSource.initialize();
  savedAddresses = await loadAddresses();
  return {
    insertSubscription,
    getSubscriptionsUserIds,
    getSubscriptionAddress,
    searchAddresses,
    setSubscriptionActive,
    setSubscriptionAddress,
  };
}

async function loadAddresses(): Promise<string[]> {
  const addressesData = await new Promise<string>((resolve) => {
    fs.readFile(ADDRESSES_FILE_PATH, 'utf-8', (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
  return addressesData.split('\n');
}

async function insertSubscription(dto: InsertSubscriptionDTO): Promise<Date> {
  const {
    generatedMaps: [{ createdAt }],
  } = await AppDataSource.manager.insert('subscription', dto);
  return createdAt;
}

async function getSubscriptionsUserIds(event: Event): Promise<number[]> {
  const addresses = event.addresses.join(';');
  return (
    await AppDataSource.manager
      .createQueryBuilder(Subscription, 'subscription')
      .select('subscription.userId')
      .where('is_active=true')
      .andWhere(":addresses LIKE '%' || address || '%'", {
        addresses,
      })
      .getMany()
  ).map((s) => s.userId);
}

async function getSubscriptionAddress(userId: number): Promise<string> {
  return (
    await AppDataSource.manager.findOneOrFail<Subscription>('subscription', {
      where: { userId },
    })
  ).address;
}

async function searchAddresses(address: string): Promise<string[]> {
  return savedAddresses.filter((a) => a.includes(address));
}

async function setSubscriptionActive(
  userId: number,
  isActive: boolean,
): Promise<boolean> {
  const res = await AppDataSource.manager.update(
    'subscription',
    {
      userId,
    },
    { isActive },
  );
  return res.affected === 1;
}

async function setSubscriptionAddress(
  userId: number,
  address: string,
): Promise<boolean> {
  const res = await AppDataSource.manager.update(
    'subscription',
    {
      userId,
    },
    { address },
  );
  return res.affected === 1;
}
