import { hash } from 'bcrypt';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { v4 } from 'uuid';
import { User } from '../../entities/User';

export class CreateUsers1648088037083 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    if (process.env.ADMIN_PASSWORD && process.env.ADMIN_USERNAME) {
      const hashPassword = await hash(process.env.ADMIN_PASSWORD!, 8);

      await queryRunner.manager.save(
        queryRunner.manager.create<User>(User, {
          email: process.env.ADMIN_USERNAME,
          role: 'admin',
          password: hashPassword,
          id: v4()
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
