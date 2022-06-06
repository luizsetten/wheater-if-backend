import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Station } from '../entities/Station';

export class StationController {
  async create(request: Request, response: Response): Promise<void> {
    const station = new Station();

    const {
      body: {
        name,
        latitude,
        longitude,
        location,
        user
      }
    } = request;

    const foundStation = await this.findByName(name);

    if (foundStation) {
      response.status(409).send({ error: 'Station name already exists' });
      return;
    }

    Object.assign(station, {
      name,
      latitude,
      longitude,
      location,
      user: user.id
    });

    const conn = await getConnection();

    const saved = await conn.manager.save(station);

    response.send(saved);
  }

  async update(request: Request, response: Response): Promise<void> {
    const {
      body: {
        name,
        latitude,
        longitude,
        location,
        id,
        user
      }
    } = request;

    const station = await this.findById(id);

    if (!(user?.role === 'admin' || station?.user?.id === user?.id)) {
      response.status(401).send({ error: "You don't have permissions to edit this station" });
      return;
    }

    const foundName = await this.findByName(name);
    if (foundName && foundName.id !== id) {
      response.status(409).send({ error: 'Station name already exists' });
      return;
    }

    Object.assign(station, {
      name,
      latitude,
      longitude,
      location,
    });

    const conn = await getConnection();

    const saved = await conn.manager.save(station);

    response.send(saved);
  }

  async list(_request: Request, response: Response): Promise<void> {
    const conn = await getConnection();

    const stations = await conn.getRepository(Station).find();

    // [{
    //   name: "IFSULDEMINAS 1",
    //   id: "5663b746-744a-40a4-a590-a7ac9abc48d8"
    // }]

    response.send({ stations });
  }

  async listByUser(request: Request, response: Response) {
    const {
      user: {
        id: user_id,
        role
      }
    } = request.body;

    const conn = await getConnection();

    if (role === 'admin') {
      const stations = await conn
        .getRepository(Station)
        .find();

      return response.send({ stations });
    }

    const stations = await conn
      .getRepository(Station)
      .createQueryBuilder('station')
      .where('station.userId = :user_id', { user_id })
      .getMany();

    return response.send({ stations });
  }

  async findByName(name: string) {
    const conn = await getConnection();

    const station = await conn
      .getRepository(Station)
      .createQueryBuilder('station')
      .where('station.name = :name', { name })
      .getOne();

    return station;
  }

  async findById(id: string) {
    const conn = await getConnection();

    const station = await conn
      .getRepository(Station)
      .createQueryBuilder('station')
      .where('station.id = :id', { id })
      .leftJoinAndSelect('station.user', 'user')
      .getOne();

    return station;
  }
}
