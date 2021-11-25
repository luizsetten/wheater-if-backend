import { v4 as uuidV4 } from 'uuid';
import {
  Column, PrimaryColumn, CreateDateColumn, Entity,
} from 'typeorm';

@Entity('logs')
class Log {
  @PrimaryColumn()
  id?: string;

  @Column()
  temperature_avg: number;

  @Column()
  temperature_min: number;

  @Column()
  temperature_max: number;

  @Column()
  humidity_avg: number;

  @Column()
  humidity_min: number;

  @Column()
  humidity_max: number;

  @Column()
  pressure_avg: number;

  @Column()
  precipitation_avg: number;

  @Column()
  precipitation_min: number;

  @Column()
  precipitation_max: number;

  @Column()
  solar_incidence_avg: number;

  @Column()
  solar_incidence_min: number;

  @Column()
  solar_incidence_max: number;

  @Column()
  wind_direction_avg: number;

  @Column()
  wind_speed_avg: number;

  @Column()
  reference_date: Date;

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

export { Log }