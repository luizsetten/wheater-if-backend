/* eslint-disable no-restricted-syntax */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixWindDirection1657066518082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "logs" ALTER COLUMN "wind_direction_avg" TYPE FLOAT8 USING CAST("wind_direction_avg" AS FLOAT8)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "logs" ALTER COLUMN "wind_direction_avg" TYPE VARCHAR',
    );
  }
}
