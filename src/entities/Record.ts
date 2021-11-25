import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity,
} from 'typeorm';

@Entity('records')
class Record {
  @PrimaryColumn()
  id?: string;

  @Column()
  temperature: number;

  @Column()
  humidity: number;

  @Column()
  pressure: number;

  @Column()
  precipitation: number;

  @Column()
  solar_incidence: number;

  @Column()
  wind_direction: number;

  @Column()
  wind_speed: number;

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