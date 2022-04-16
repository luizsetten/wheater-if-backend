import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity,
} from 'typeorm';

@Entity('users')
class User {
  @PrimaryColumn()
  id?: string;

  @Column()
  email: string;

  @Column()
  password: number;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { User }