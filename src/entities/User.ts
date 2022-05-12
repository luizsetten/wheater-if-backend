import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity, OneToMany,
} from 'typeorm';
import { Station } from './Station';

@Entity('users')
class User {
  @PrimaryColumn()
  id?: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToMany(() => Station, (station) => station.user)
  stations: Station[];

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
      this.role = 'user';
    }
  }
}

export { User };
