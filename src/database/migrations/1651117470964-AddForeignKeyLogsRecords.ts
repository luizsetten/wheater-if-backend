import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeyLogsRecords1651117470964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'logs',
      new TableForeignKey({
        columnNames: ['stationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stations',
      }),
    );

    await queryRunner.createForeignKey(
      'records',
      new TableForeignKey({
        columnNames: ['stationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stations',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('records');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('stationId') !== -1,
    )!;

    await queryRunner.dropForeignKey('records', foreignKey);

    const table2 = await queryRunner.getTable('logs');
    const foreignKey2 = table2?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('stationId') !== -1,
    )!;

    await queryRunner.dropForeignKey('logs', foreignKey2);
  }
}
