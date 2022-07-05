import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Record } from '../entities/Record';

function mode(arr: Array<number>) {
  return arr.sort((a, b) => arr.filter((v) => v === a).length
    - arr.filter((v) => v === b).length).pop();
}
export class RecordController {
  public async create(request: Request, response: Response): Promise<void> {
    try {
      const record = new Record();

      const {
        body: {
          temperature,
          humidity,
          pressure,
          solar_incidence,
          wind_direction,
          wind_speed,
          wind_gust,
          precipitation,
          station_id,
        },
      } = request;

      const windDir: Array<number> = String(wind_direction).split(',').map((item) => Number(item));

      const windDirectionResolved = windDir ? mode(windDir) : 0;

      console.log('Salvou!', record.id, request.body);

      Object.assign(record, {
        temperature,
        humidity,
        pressure,
        precipitation,
        solar_incidence,
        wind_direction: windDirectionResolved,
        wind_speed,
        wind_gust,
        stationId: station_id,
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
        .createQueryBuilder('record')
        .where('record.stationId = :id', { id: station_id })
        .getMany();

      response.send(records);
    } else {
      const records = await conn
        .getRepository(Record)
        .createQueryBuilder('record')
        .getMany();

      response.send(records);
    }
  }

  async findLast(request: Request, response: Response): Promise<void> {
    const { station_id } = request.params;
    const conn = await getConnection();

    if (station_id) {
      const record = await conn
        .getRepository(Record)
        .createQueryBuilder('record')
        .where('record.stationId = :id', { id: station_id })
        .orderBy('created_at', 'DESC')
        .getOne();

      response.send(record);
    } else {
      const record = await conn
        .getRepository(Record)
        .createQueryBuilder('record')
        .orderBy('created_at', 'DESC')
        .getOne();

      response.send(record);
    }
  }
}
