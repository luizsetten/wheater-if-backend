import { Request, Response } from "express";
import { getConnection } from "typeorm";

import { Record } from "../entities/Record";
import { Log } from "../entities/Log";
import { groupByTime } from "../utils/time";
import { parseAsync } from "json2csv";
import { onlyUnique } from "../utils/array";
import { format, parse } from "date-fns";

export class LogsController {
  async update(_request: Request, response: Response) {
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

    const conn = getConnection();

    const records = await conn
      .getRepository(Record)
      .createQueryBuilder("record")
      .orderBy("record.created_at", 'ASC')
      .getMany();


    const stations = records.map(rec => rec.station_id).filter(onlyUnique);

    const recordsToRestore = stations.map(station => {
      const filtered = records.filter(rec => rec.station_id === station);

      const record = new Record();

      Object.assign(record, { ...filtered[filtered.length - 1], in_log: true })
      return record;
    });

    stations.forEach(async (station) => {
      const stationRecords = records.filter(record => record.station_id === station && record.in_log === false);
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

    recordsToRestore.forEach(record => {
      conn.getRepository(Record).save(record);
    })

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

    const logsFormatted = logs.map(log => {
      return {
        id: log.id,
        temperature_avg: log.temperature_avg.toFixed(2),
        temperature_min: log.temperature_min.toFixed(2),
        temperature_max: log.temperature_max.toFixed(2),
        humidity_avg: log.humidity_avg.toFixed(2),
        humidity_min: log.humidity_min.toFixed(2),
        humidity_max: log.humidity_max.toFixed(2),
        pressure_avg: log.pressure_avg.toFixed(2),
        precipitation_avg: log.precipitation_avg.toFixed(2),
        precipitation_min: log.precipitation_min.toFixed(2),
        precipitation_max: log.precipitation_max.toFixed(2),
        solar_incidence_avg: log.solar_incidence_avg.toFixed(2),
        solar_incidence_min: log.solar_incidence_min.toFixed(2),
        solar_incidence_max: log.solar_incidence_max.toFixed(2),
        wind_direction_avg: log.wind_direction_avg,
        wind_speed_avg: log.wind_speed_avg.toFixed(2),
        date: format(log.reference_date, 'dd/MM/yyyy'),
        hours: format(log.reference_date, 'HH:mm')
      }
    })

    const file = await parseAsync(logsFormatted, {
      fields: [
        { value: "date", label: 'Data' },
        { value: "hours", label: 'Hora' },
        { value: "id", label: 'ID' },
        { value: "temperature_min", label: "Temperatura Mínima (°C)" },
        { value: "temperature_avg", label: "Temperatura Média (°C)" },
        { value: "temperature_max", label: "Temperatura Máxima (°C)" },
        { value: "pressure_avg", label: "Pressão atmosférica (hPa)" },
        { value: "humidity_min", label: "Humidade Mínima (%)" },
        { value: "humidity_avg", label: "Humidade Média (%)" },
        { value: "humidity_max", label: "Humidade Máxima (%)" },
        { value: "precipitation_min", label: "Precipitação Mínima (mm)" },
        { value: "precipitation_avg", label: "Precipitação Média (mm)" },
        { value: "precipitation_max", label: "Precipitação Máxima (mm)" },
        { value: "solar_incidence_min", label: "Incidência Solar Mínima (mW/m²)" },
        { value: "solar_incidence_avg", label: "Incidência Solar Média (mW/m²)" },
        { value: "solar_incidence_max", label: "Incidência Solar Máxima (mW/m²)" },
        { value: "wind_direction_avg", label: "Direção do vento (°N)" },
        { value: "wind_speed_avg", label: "Velocidade do Vento (m/s)" },
      ],

      delimiter: ';'
    });

    response.send(file);
  }
}