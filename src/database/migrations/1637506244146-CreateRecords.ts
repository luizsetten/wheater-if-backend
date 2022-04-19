import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRecords1637506244146 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(new Table({
			name: "records",
			columns: [
				{
					name: "id",
					type: "uuid",
					isPrimary: true
				},
				{
					name: "humidity",
					type: "float",
					isNullable: true,
				},
				{
					name: "pressure",
					type: "float",
					isNullable: true,
				},
				{
					name: "precipitation",
					type: "float",
					isNullable: true,
				},
				{
					name: "solar_incidence",
					type: "float",
					isNullable: true,
				},
				{
					name: "temperature",
					type: "float",
					isNullable: true,
				},
				{
					name: "wind_direction",
					type: "float",
					isNullable: true,
				},
				{
					name: "wind_speed",
					type: "float",
					isNullable: true,
				},
				{
					name: "station_id",
					type: "varchar",
					isNullable: true,
				},
				{
					name: "in_log",
					type: "boolean",
					default: false,
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
