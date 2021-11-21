import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity,
} from 'typeorm';

@Entity('records')
class Record {
  @PrimaryColumn()
  id?: string;

  @Column()
  temperature: string;

  @Column()
  humidity: string;

  @Column()
  pressure: string;

  @Column()
  solar_incidence: string;

  @Column()
  wind_direction: string;

  @Column()
  wind_speed: string;

  @Column()
  station_id: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Record }