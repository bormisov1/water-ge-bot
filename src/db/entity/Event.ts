import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Address } from './Address';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany((type) => Address)
  @JoinTable()
  addresses!: Address[];

  @CreateDateColumn({ name: 'start', type: 'timestamp' })
  start!: Date;

  @CreateDateColumn({ name: 'end', type: 'timestamp' })
  end!: Date;
}
