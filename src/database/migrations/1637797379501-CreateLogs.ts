import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLogs1637797379501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'logs',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
        },
        {
          name: 'temperature_avg',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'temperature_min',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'temperature_max',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'humidity_avg',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'humidity_min',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'humidity_max',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'pressure_avg',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'pressure_min',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'pressure_max',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'precipitation_acc',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'solar_incidence_avg',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'solar_incidence_min',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'solar_incidence_max',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'wind_direction_avg',
          type: 'varchar',
          isNullable: true,
        },
        {
          name: 'wind_speed_avg',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'wind_speed_min',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'wind_speed_max',
          type: 'float',
          isNullable: true,
        },
        {
          name: 'stationId',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'records_amount',
          type: 'int'
        },
        {
          name: 'reference_date',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('logs');
  }
}
