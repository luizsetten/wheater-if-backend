import { Record } from "../entities/Record";
import { Request, Response } from "express";
import { createConnection } from "typeorm";

export class RecordController {
  public async create(request: Request, response: Response): Promise<void> {
    try {

      const record = new Record();

      const { body: {
        temperature,
        humidity,
        pressure,
        solar_incidence,
        wind_direction,
        wind_speed,
        station_id,
      } } = request;

      Object.assign(record, {
        temperature,
        humidity,
        pressure,
        solar_incidence,
        wind_direction,
        wind_speed,
        station_id,
      });

      const conn = await createConnection();

      const saved = await conn.manager.save(record);

      response.send(saved);
    } catch (e) {
      console.log(e);
      response.sendStatus(500);
    }
  }

  list() {

  }

  findById() {

  }

  findLast() {

  }
}