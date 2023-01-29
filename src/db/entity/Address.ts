import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'city', type: 'text' })
  city!: string;

  @Column({ name: 'street', type: 'text' })
  street!: string;
}
