import {Entity, PrimaryGeneratedColumn, Column, JoinTable, CreateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { BaseEntity } from './base'

@Entity()
export class User extends BaseEntity {

    @Column('varchar', {
      unique: true,
    })
  name!: string;

    @Column('date')
    birthday?: Date;

  @ManyToMany('Author', 'fans')
  @JoinTable()
    favAuthors?: Author[]
}