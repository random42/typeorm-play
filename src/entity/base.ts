import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid', {})
  id!: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
  })
  deletedAt!: Date;
}
