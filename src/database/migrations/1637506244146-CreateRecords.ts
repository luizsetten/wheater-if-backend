import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRecords1637506244146 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(new Table({
			name: "records",
			columns: [
				{
					name: "id",
					type: "string",
					isPrimary: true
				},
				{
					name: "humidity",
					type: "number",
					isNullable: true,
				},
				{
					name: "pressure",
					type: "number",
					isNullable: true,
				},
				{
					name: "solar_incidence",
					type: "number",
					isNullable: true,
				},
				{
					name: "wind_direction",
					type: "string",
					isNullable: true,
				},
				{
					name: "wind_speed",
					type: "number",
					isNullable: true,
				},
				{
					name: "station_id",
					type: "string",
					isNullable: true,
				},
				{
					name: "created_at",
					type: "timestamp",
					default: "now()"
				}
			]
		}))
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("records")
	}

}
