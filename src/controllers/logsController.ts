import { Request, Response } from "express";
import { getConnection } from "typeorm";

import { Record } from "../entities/Record";
import { Log } from "../entities/Log";
import { groupByTime } from "../utils/time";
import { parseAsync } from "json2csv";

export class LogsController {
  async update(request: Request, response: Response) {
    const conn = getConnection();

    const records = await conn
      .getRepository(Record)
      .createQueryBuilder("records")
      .getMany();


    let stations: Array<string> = [];

    records.forEach(record => {
      if (!!record.station_id && !stations.includes(record.station_id)) {
        stations.push(record.station_id);
      }
    });

    const createLog = (records: Array<Record>): Log => {
      const log = new Log();

      const temperature = records.map(({ temperature }) => temperature);
      const humidity = records.map(({ humidity }) => humidity);
      const pressure = records.map(({ pressure }) => pressure);
      const wind_speed = records.map(({ wind_speed }) => wind_speed);
      const wind_direction = records.map(({ wind_direction }) => wind_direction);
      const precipitation = records.map(({ precipitation }) => precipitation);
      const solar_incidence = records.map(({ solar_incidence }) => solar_incidence);

      const date = records[0].created_at;
      const reference_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - 3);

      Object.assign(log, {
        temperature_avg: temperature.reduce((acc, obj) => acc += obj, 0) / records.length,
        temperature_max: Math.max(...temperature),
        temperature_min: Math.min(...temperature),
        humidity_avg: humidity.reduce((acc, obj) => acc += obj, 0) / records.length,
        humidity_max: Math.max(...humidity),
        humidity_min: Math.min(...humidity),
        precipitation_avg: precipitation.reduce((acc, obj) => acc += obj, 0) / records.length,
        precipitation_max: Math.max(...precipitation),
        precipitation_min: Math.min(...precipitation),
        solar_incidence_avg: solar_incidence.reduce((acc, obj) => acc += obj, 0) / records.length,
        solar_incidence_max: Math.max(...solar_incidence),
        solar_incidence_min: Math.min(...solar_incidence),
        pressure_avg: pressure.reduce((acc, obj) => acc += obj, 0) / records.length,
        wind_speed_avg: wind_speed.reduce((acc, obj) => acc += obj, 0) / records.length,
        wind_direction_avg: wind_direction.reduce((acc, obj) => acc += obj, 0) / records.length,
        reference_date,
        station_id: records[0].station_id
      } as Log)

      return log;
    }

    stations.forEach(station => {
      const stationRecords = records.filter(record => record.station_id === station);
      const grouped: Object = groupByTime(stationRecords);

      const values: Record[][] = Object.values(grouped)
      values.forEach(records => {
        const log = createLog(records);

        conn.getRepository(Log).save(log);
      });
    });

    await conn
      .createQueryBuilder()
      .delete()
      .from(Record)
      .execute();

    response.sendStatus(201);
  }

  async list(request: Request, response: Response) {
    const { station_id, reference_date_min, reference_date_max } = request.params;

    const conn = getConnection();

    const log = conn.getRepository(Log);

    const logs = await log.createQueryBuilder("log")
      .where('log.station_id = :station_id', { station_id }) // No momento só há uma estação
      .andWhere("log.reference_date >= :reference_date_min", { reference_date_min: new Date(reference_date_min) })
      .andWhere('log.reference_date <= :reference_date_max', { reference_date_max: new Date(reference_date_max) })
      .orderBy("log.reference_date", "ASC")
      .getMany();

    response.send({ logs });
  }

  async downloadCSV(request: Request, response: Response) {
    const { station_id, reference_date_min, reference_date_max } = request.params;

    const conn = getConnection();

    const log = conn.getRepository(Log);

    const logs = await log.createQueryBuilder("log")
      .where('log.station_id = :station_id', { station_id }) // No momento só há uma estação
      .andWhere("log.reference_date >= :reference_date_min", { reference_date_min: new Date(reference_date_min) })
      .andWhere('log.reference_date <= :reference_date_max', { reference_date_max: new Date(reference_date_max) })
      .orderBy("log.reference_date", "ASC")
      .getMany();

    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", "attachment; filename=logs.csv");

    const file = await parseAsync(logs);

    response.send(file);
  }
}