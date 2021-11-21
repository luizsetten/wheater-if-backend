import { RecordController } from './controllers/recordController';
import express, { Request, Response } from 'express';
import "reflect-metadata";
import './config/datasabe';

const app = express();
app.use(express.json());

const recordController = new RecordController()

app.get('/', (request: Request, response: Response) => {
  response.send(200);
});

app.post('/', recordController.create);

app.listen(3333, () => console.log('Server is listening on http://localhost:3333/'));
