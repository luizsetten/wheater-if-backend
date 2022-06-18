import { hash, compare } from 'bcrypt';

import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';

export class UsersController {
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
      return response.status(409).json({
        message: 'User already exists!',
      });
    }

    await conn.manager.save(user);

    return response.status(201).send();
  }

  async list(request: Request, response: Response) {
    const { user: { role } } = request.body;

    if (role !== 'admin') return response.status(401).json({ message: 'User needs to de admin' });

    const conn = await getConnection();

    const users = await conn.getRepository(User).find();

    return response.send({ users });
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

  async update(request: Request, response: Response): Promise<void> {
    const {
      body: {
        email,
        role,
        id,
        user
      }
    } = request;

    // const usersController = new UsersController();
    // const userFound = await usersController.findById(user);

    const userToEditFound = await this.findById(id);

    if (!userToEditFound) {
      response.status(404).send({ error: 'User not found' });
      return;
    }

    if (!(user.role === 'admin' || user.id === id)) {
      response.status(401).send({ error: "You don't have permissions to edit this user" });
      return;
    }

    const foundEmail = await this.findByEmail(email);
    if (foundEmail && foundEmail.id !== id) {
      response.status(409).send({ error: 'User email already exists' });
      return;
    }

    Object.assign(userToEditFound, {
      email,
      role
    });

    const conn = await getConnection();

    const saved = await conn.manager.save(userToEditFound);

    response.send(saved);
  }

  public async authenticate(request: Request, response: Response) {
    const { email, password } = request.body;

    const user = await this.findByEmail(email);

    if (!user || await compare(user.password, password)) {
      return response.status(401).json({
        message: 'Invalid email or password!',
      });
    }

    const token = sign({
      email: user.email,
      role: user.role
    }, process.env.SECRET, {
      subject: user.id,
      expiresIn: '1d'
    });

    return response.send({
      user: {
        email: user.email,
        role: user.role
      },
      token
    });
  }

  async runCommandSQL(request: Request, response: Response) {
    const { command } = request.body;
    const conn = await getConnection();

    const commandResult = conn.query(command);

    return response.send({
      commandResult
    });
  }
}
