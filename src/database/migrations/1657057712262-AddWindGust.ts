import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddWindGust1657057712262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('records', new TableColumn({
      name: 'wind_gust',
      type: 'float',
      isNullable: true,
    }));

    await queryRunner.addColumns('logs', [new TableColumn({
      name: 'wind_gust_avg',
      type: 'float',
      isNullable: true,
    }),
    new TableColumn({
      name: 'wind_gust_min',
      type: 'float',
      isNullable: true,
    }),
    new TableColumn({
      name: 'wind_gust_max',
      type: 'float',
      isNullable: true,
    })]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('logs', ['wind_gust_avg', 'wind_gust_min', 'wind_gust_max']);

    await queryRunner.dropColumn('records', 'wind_gust');
  }
}
