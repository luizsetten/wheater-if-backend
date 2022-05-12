import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity, ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity('stations')
class Station {
  @PrimaryColumn()
  id?: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.stations)
  user: User;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  location: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Station };
