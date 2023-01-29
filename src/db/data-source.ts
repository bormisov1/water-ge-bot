import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Subscription } from './entity/Subscription';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '0.0.0.0',
  port: 5432,
  username: 'user',
  password: 'admin',
  database: 'bot_subscription',
  synchronize: true,
  logging: true,
  entities: [Subscription],
  subscribers: [],
  migrations: [],
});
