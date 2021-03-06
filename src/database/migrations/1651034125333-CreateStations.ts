import {
  MigrationInterface, QueryRunner, Table,
} from 'typeorm';
import { Station } from '../../entities/Station';

export class CreateStations1651034125333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'stations',
      columns: [{
        name: 'id',
        type: 'uuid',
        isPrimary: true,
      },
      {
        name: 'name',
        type: 'varchar',
        isUnique: true,
      },
      {
        name: 'location',
        type: 'varchar',
        isNullable: true,
      },
      {
        name: 'latitude',
        type: 'float',
        isNullable: true,
      },
      {
        name: 'longitude',
        type: 'float',
        isNullable: true,
      },
      {
        name: 'userId',
        type: 'uuid',
        isNullable: true,
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      },
      ],
      foreignKeys: [{
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }],
    }));

    if (process.env.STATION_ID) {
      await queryRunner.manager.save(
        queryRunner.manager.create<Station>(Station, {
          name: 'IFSULDEMINAS 1',
          id: process.env.STATION_ID
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stations');
  }
}
