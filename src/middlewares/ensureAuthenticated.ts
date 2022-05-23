import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UsersController } from '../controllers/usersController';

interface IPayload {
  sub: string;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    // throw new Error("Token missing");
    return response.status(403).json({ message: 'No token provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, '17a1ab8c7a756f5283ee5db6b1d62fff') as IPayload;

    const usersController = new UsersController();

    const user = await usersController.findById(decoded.sub);

    if (!user) return response.status(403).json({ message: 'User does not exist' });

    request.body = {
      ...request.body,
      user
    };

    return next();
  } catch {
    // throw new Error("Invalid token");
    return response.status(403).json({ message: 'Invalid token' });
  }
}
