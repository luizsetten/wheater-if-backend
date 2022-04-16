import { Record } from "../entities/Record";
import { Request, Response } from "express";
import { getConnection } from "typeorm";

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
        precipitation,
        station_id,
      } } = request;

      const windDir: Array<number> = String(wind_direction).split(',').map(item => Number(item));
      console.log("Salvou!", record.id, request.body);

      function mode(arr: Array<number>) {
        return arr.sort((a, b) =>
          arr.filter(v => v === a).length
          - arr.filter(v => v === b).length
        ).pop();
      }

      const windDirectionResolved = windDir ? mode(windDir) : undefined;


      Object.assign(record, {
        temperature,
        humidity,
        pressure,
        precipitation,
        solar_incidence,
        wind_direction: windDirectionResolved,
        wind_speed,
        station_id,
      });

      const conn = await getConnection();

      const saved = await conn.manager.save(record);

      response.send(saved);
    } catch (e) {
      console.log(e);
      response.sendStatus(500);
    }
  }

  async list(request: Request, response: Response): Promise<void> {
    const { station_id } = request.query;
    const conn = await getConnection();

    if (station_id) {
      const records = await conn
        .getRepository(Record)
        .createQueryBuilder("record")
        .where("record.station_id = :id", { id: station_id })
        .getMany();

      response.send(records);
    } else {
      const records = await conn
        .getRepository(Record)
        .createQueryBuilder("record")
        .getMany();

      response.send(records);
    }
  }

  async findLast(request: Request, response: Response): Promise<void> {
    const { station_id } = request.query;
    const conn = await getConnection();

    if (station_id) {
      const record = await conn
        .getRepository(Record)
        .createQueryBuilder("record")
        .where("record.station_id = :id", { id: station_id })
        .orderBy("created_at", "DESC")
        .getOne();

      response.send(record);
    } else {
      const record = await conn
        .getRepository(Record)
        .createQueryBuilder("record")
        .orderBy("created_at", "DESC")
        .getOne();

      response.send(record);
    }
  }
}