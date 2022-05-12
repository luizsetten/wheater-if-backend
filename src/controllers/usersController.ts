import { hash, compare } from 'bcrypt';

import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';

export class UsersController {
  public async authenticate(request: Request, response: Response) {
    const { email, password } = request.body;

    const user = await this.findByEmail(email);

    if (!user || await compare(user.password, password)) {
      return response.status(503).json({
        message: 'Invalid email or password!',
      });
    }

    return response.send({
      email: user.email,
      role: user.role,
      stations: user.stations,
      token: user.id
    });
  }

  public async create(request: Request, response: Response) {
    const { email, password } = request.body;
    response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin');

    const user = new User();

    Object.assign(user, {
      email,
      password: await hash(password, 8),
    });

    const conn = await getConnection();

    const userAlreadyExists = await this.findByEmail(email);

    if (userAlreadyExists) {
      return response.status(503).json({
        message: 'User already exists!',
      });
    }

    await conn.manager.save(user);

    return response.status(201).send();
  }

  public async findByEmail(email: string) {
    const conn = await getConnection();

    const user = await conn
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();

    return user;
  }

  public async findById(id: string) {
    const conn = await getConnection();

    const user = await conn
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    return user;
  }
}
