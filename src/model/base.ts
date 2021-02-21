import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToOne, ManyToMany } from "typeorm";

export class BaseEntity {

    @PrimaryGeneratedColumn('uuid', {

    })
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
