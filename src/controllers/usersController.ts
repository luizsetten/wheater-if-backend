import { hash } from "bcrypt"

import { User } from "../entities/User";
import { Request, Response } from "express";
import { getConnection } from "typeorm";

export class UsersController {
  public async create(request: Request, response: Response) {
    const { email, password } = request.body;

    const user = new User();

    Object.assign(user, {
      email,
      password: hash(password, 8)
    });

    const conn = await getConnection();

    const userAlreadyExists = await this.findByEmail(email);

    if (userAlreadyExists) {
      return response.status(503).json({
        message: "User already exists!"
      });
    }

    const saved = conn.manager.save(user);

    return response.status(201).send();
  }

  public async findByEmail(email: string) {
    const conn = await getConnection();

    const user = await conn
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();

    return user;
  }
}