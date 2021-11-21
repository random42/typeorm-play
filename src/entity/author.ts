import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { BaseEntity } from './base'
import { Book } from "./book";
import { User } from "./user";

@Entity()
export class Author extends BaseEntity {

    @Column('varchar')
  name!: string;

    @Column('date')
  birthday!: Date;

  @OneToMany('Book', 'author', {
    cascade: true
  })
  books?: Book[]

  @ManyToMany('User', 'favAuthors')
  fans?: User[]
}
