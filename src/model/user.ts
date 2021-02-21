import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid', {

    })
  id!: number;

    @Column('varchar')
  firstName!: string;

    @Column('varchar', {
      length: 255,
    })
  lastName!: string;

    @Column('integer')
  age!: number;
}
