import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from './base';
import { Book } from './book';

@Entity()
export class Chapter extends BaseEntity {
  @Column('varchar')
  name!: string;

  @Column('text')
  text!: string;

  @ManyToOne('Book', 'chapters', {
    eager: true,
  })
  book!: Book;
}
