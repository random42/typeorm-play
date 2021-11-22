import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from './base';
import { Chapter } from './chapter';
import { Author } from './author';

@Entity()
export class Book extends BaseEntity {
  @Column('varchar')
  name!: string;

  @Column('date', { nullable: true })
  publishDate?: Date;

  @ManyToOne('Author', 'books', {
    eager: true,
  })
  author!: Author;

  @OneToMany('Chapter', 'book', {
    cascade: true,
  })
  chapters?: Chapter[];
}
