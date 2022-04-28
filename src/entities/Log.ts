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
    pressure_min: number;

  @Column()
    pressure_max: number;

  @Column()
    precipitation_acc: number;

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
    wind_speed_min: number;

  @Column()
    wind_speed_max: number;

  @Column()
    reference_date: Date;

  @Column()
    stationId: string;

  @CreateDateColumn()
    created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Log };
