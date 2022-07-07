/* eslint-disable max-len */
import { Request, Response } from 'express';
import { getConnection } from 'typeorm';

import { parseAsync } from 'json2csv';
import { addHours, format } from 'date-fns';
import { Record } from '../entities/Record';
import { Log } from '../entities/Log';
import { groupByTime } from '../utils/time';
import { onlyUnique } from '../utils/array';
import { convertToNumberFixed } from '../utils/converts';

export class LogsController {
  async update(_request: Request, response: Response) {
    const createLog = (records: Array<Record>): Log => {
      const log = new Log();

      const temperature = records.map(({ temperature }) => temperature);
      const humidity = records.map(({ humidity }) => humidity);
      const pressure = records.map(({ pressure }) => pressure);
      const wind_speed = records.map(({ wind_speed }) => wind_speed);
      const wind_gust = records.map(({ wind_gust }) => wind_gust);
      const wind_direction = records.map(({ wind_direction }) => wind_direction);
      const precipitation = records.map(({ precipitation }) => precipitation);
      const solar_incidence = records.map(({ solar_incidence }) => solar_incidence);

      const date = records[0].created_at;
      const reference_date = new Date(date.setMinutes(0, 0, 0));

      Object.assign(log, {
        temperature_avg: temperature.reduce((acc, obj) => acc += obj, 0) / records.length,
        temperature_max: Math.max(...temperature),
        temperature_min: Math.min(...temperature),
        humidity_avg: humidity.reduce((acc, obj) => acc += obj, 0) / records.length,
        humidity_max: Math.max(...humidity),
        humidity_min: Math.min(...humidity),
        precipitation_acc: precipitation.reduce((acc, obj) => acc += obj, 0),
        solar_incidence_avg: solar_incidence.reduce((acc, obj) => acc += obj, 0) / records.length,
        solar_incidence_max: Math.max(...solar_incidence),
        solar_incidence_min: Math.min(...solar_incidence),
        pressure_avg: pressure.reduce((acc, obj) => acc += obj, 0) / records.length,
        pressure_max: Math.max(...pressure),
        pressure_min: Math.min(...pressure),
        wind_speed_avg: wind_speed.reduce((acc, obj) => acc += obj, 0) / records.length,
        wind_speed_max: Math.max(...wind_speed),
        wind_speed_min: Math.min(...wind_speed),
        wind_gust_avg: wind_gust.reduce((acc, obj) => acc += obj, 0) / records.length,
        wind_gust_max: Math.max(...wind_gust),
        wind_gust_min: Math.min(...wind_gust),
        wind_direction_avg: wind_direction.reduce((acc, obj) => acc += obj, 0) / records.length,
        records_amount: records.length,
        stationId: records[0].stationId,
        reference_date,
      } as Log);

      return log;
    };

    const mergeLogs = (oldLog: Log, newLog: Log) => ({
      ...oldLog,
      temperature_avg: ((oldLog.temperature_avg * oldLog.records_amount) + (newLog.temperature_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      temperature_max: Math.max(oldLog.temperature_max, newLog.temperature_max),
      temperature_min: Math.min(oldLog.temperature_min, newLog.temperature_min),
      humidity_avg: ((oldLog.humidity_avg * oldLog.records_amount) + (newLog.humidity_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      humidity_max: Math.max(oldLog.humidity_max, newLog.humidity_max),
      humidity_min: Math.min(oldLog.humidity_min, newLog.humidity_min),
      precipitation_acc: oldLog.precipitation_acc + newLog.precipitation_acc,
      solar_incidence_avg: ((oldLog.solar_incidence_avg * oldLog.records_amount) + (newLog.solar_incidence_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      solar_incidence_max: Math.max(oldLog.solar_incidence_max, newLog.solar_incidence_max),
      solar_incidence_min: Math.min(oldLog.solar_incidence_min, newLog.solar_incidence_min),
      pressure_avg: ((oldLog.pressure_avg * oldLog.records_amount) + (newLog.pressure_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      pressure_max: Math.max(oldLog.pressure_max, newLog.pressure_max),
      pressure_min: Math.min(oldLog.pressure_min, newLog.pressure_min),
      wind_speed_avg: ((oldLog.wind_speed_avg * oldLog.records_amount) + (newLog.wind_speed_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      wind_speed_max: Math.max(oldLog.wind_speed_max, newLog.wind_speed_max),
      wind_speed_min: Math.min(oldLog.wind_speed_min, newLog.wind_speed_min),
      wind_gust_avg: ((oldLog.wind_gust_avg * oldLog.records_amount) + (newLog.wind_gust_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      wind_gust_max: Math.max(oldLog.wind_gust_max, newLog.wind_gust_max),
      wind_gust_min: Math.min(oldLog.wind_gust_min, newLog.wind_gust_min),
      wind_direction_avg: ((oldLog.wind_direction_avg * oldLog.records_amount) + (newLog.wind_direction_avg * newLog.records_amount)) / (oldLog.records_amount + newLog.records_amount),
      records_amount: oldLog.records_amount + newLog.records_amount,
    });

    const conn = getConnection();

    const records = await conn
      .getRepository(Record)
      .createQueryBuilder('record')
      .orderBy('record.created_at', 'ASC')
      .getMany();

    const stations = records.map((rec) => rec.stationId).filter(onlyUnique);

    const recordsToRestore = stations.map((station) => {
      const filtered = records.filter((rec) => rec.stationId === station);

      const record = new Record();

      Object.assign(record, { ...filtered[filtered.length - 1], in_log: true });
      return record;
    });

    stations.forEach(async (station) => {
      const stationRecords = records.filter(
        (record) => record.stationId === station && record.in_log === false
      );
      const grouped: Object = groupByTime(stationRecords);

      const values: Record[][] = Object.values(grouped);
      values.forEach(async (records) => {
        const log = createLog(records);

        const logFound = await conn.getRepository(Log)
          .createQueryBuilder('log')
          .where('log.stationId = :station_id', { station_id: station })
          .andWhere('log.reference_date = :reference_date', { reference_date: log.reference_date })
          .getOne();

        if (logFound) {
          const logMerged = mergeLogs(logFound, log);
          await conn.getRepository(Log).save(logMerged);
        } else {
          await conn.getRepository(Log).save(log);
        }
      });
    });

    // await conn
    //   .createQueryBuilder()
    //   .delete()
    //   .from(Record)
    //   .execute();

    recordsToRestore.forEach((record) => {
      conn.getRepository(Record).save(record);
    });

    response.sendStatus(201);
  }

  async list(request: Request, response: Response) {
    const { station_id, reference_date_min, reference_date_max } = request.params;

    const conn = getConnection();

    const log = conn.getRepository(Log);

    const logs = await log.createQueryBuilder('log')
      .where('log.stationId = :station_id', { station_id }) // No momento só há uma estação
      .andWhere('log.reference_date >= :reference_date_min', { reference_date_min: new Date(reference_date_min) })
      .andWhere('log.reference_date <= :reference_date_max', { reference_date_max: new Date(reference_date_max) })
      .orderBy('log.reference_date', 'ASC')
      .getMany();

    response.send({ logs });
  }

  async downloadCSV(request: Request, response: Response) {
    const { station_id, reference_date_min, reference_date_max } = request.params;

    const conn = getConnection();

    const log = conn.getRepository(Log);

    const logs = await log.createQueryBuilder('log')
      .where('log.stationId = :station_id', { station_id }) // No momento só há uma estação
      .andWhere('log.reference_date >= :reference_date_min', { reference_date_min: new Date(reference_date_min) })
      .andWhere('log.reference_date <= :reference_date_max', { reference_date_max: new Date(reference_date_max) })
      .orderBy('log.reference_date', 'ASC')
      .getMany();

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename=logs.csv');

    const logsFormatted = logs.map((log) => ({
      id: log.id,
      temperature_avg: convertToNumberFixed(log.temperature_avg),
      temperature_min: convertToNumberFixed(log.temperature_min),
      temperature_max: convertToNumberFixed(log.temperature_max),
      humidity_avg: convertToNumberFixed(log.humidity_avg),
      humidity_min: convertToNumberFixed(log.humidity_min),
      humidity_max: convertToNumberFixed(log.humidity_max),
      pressure_avg: convertToNumberFixed(log.pressure_avg),
      pressure_min: convertToNumberFixed(log.pressure_min),
      pressure_max: convertToNumberFixed(log.pressure_max),
      precipitation_acc: convertToNumberFixed(log.precipitation_acc),
      solar_incidence_avg: convertToNumberFixed(log.solar_incidence_avg),
      solar_incidence_min: convertToNumberFixed(log.solar_incidence_min),
      solar_incidence_max: convertToNumberFixed(log.solar_incidence_max),
      wind_direction_avg: convertToNumberFixed(log.wind_direction_avg),
      wind_speed_avg: convertToNumberFixed(log.wind_speed_avg),
      wind_speed_min: convertToNumberFixed(log.wind_speed_min),
      wind_speed_max: convertToNumberFixed(log.wind_speed_max),
      wind_gust_avg: convertToNumberFixed(log.wind_gust_avg),
      wind_gust_min: convertToNumberFixed(log.wind_gust_min),
      wind_gust_max: convertToNumberFixed(log.wind_gust_max),
      date: format(addHours(log.reference_date, -3), 'dd/MM/yyyy'),
      hours: format(addHours(log.reference_date, -3), 'HH:mm'),
    }));

    const file = await parseAsync(logsFormatted, {
      fields: [
        { value: 'date', label: 'Data' },
        { value: 'hours', label: 'Hora' },
        { value: 'id', label: 'ID' },
        { value: 'temperature_avg', label: 'Temperatura Média (°C)' },
        { value: 'temperature_max', label: 'Temperatura Máxima (°C)' },
        { value: 'temperature_min', label: 'Temperatura Mínima (°C)' },
        { value: 'pressure_avg', label: 'Pressão atmosférica Média (hPa)' },
        { value: 'pressure_max', label: 'Pressão atmosférica Máxima (hPa)' },
        { value: 'pressure_min', label: 'Pressão atmosférica Mínima (hPa)' },
        { value: 'humidity_avg', label: 'Umidade Média (%)' },
        { value: 'humidity_max', label: 'Umidade Máxima (%)' },
        { value: 'humidity_min', label: 'Umidade Mínima (%)' },
        { value: 'precipitation_acc', label: 'Precipitação Acumulada (mm)' },
        { value: 'solar_incidence_avg', label: 'Incidência Solar Média (W/m²)' },
        { value: 'solar_incidence_max', label: 'Incidência Solar Máxima (W/m²)' },
        { value: 'solar_incidence_min', label: 'Incidência Solar Mínima (W/m²)' },
        { value: 'wind_direction_avg', label: 'Direção do vento (°N)' },
        { value: 'wind_speed_avg', label: 'Velocidade do Vento Média (m/s)' },
        { value: 'wind_speed_max', label: 'Velocidade do Vento Máxima (m/s)' },
        { value: 'wind_speed_min', label: 'Velocidade do Vento Mínima (m/s)' },
        { value: 'wind_gust_avg', label: 'Rajada do Vento Média (m/s)' },
        { value: 'wind_gust_max', label: 'Rajada do Vento Máxima (m/s)' },
        { value: 'wind_gust_min', label: 'Rajada do Vento Mínima (m/s)' },
      ],
      delimiter: ';',
    });

    response.send(file);
  }
}
