import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';

import './config/datasabe';

import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { LogsController } from './controllers/logsController';
import { RecordController } from './controllers/recordController';
import { UsersController } from './controllers/usersController';
import { StationController } from './controllers/stationController';

const app = express();
app.use(express.json());
app.use(cors());

const recordController = new RecordController();
const logsController = new LogsController();
const usersController = new UsersController();
const stationController = new StationController();

app.get('/', (request: Request, response: Response) => {
  console.log('Refletiu aqui');
  response.sendStatus(200);
});

app.post('/users', usersController.create.bind(usersController));
app.post('/users/authenticate', usersController.authenticate.bind(usersController));
app.put('/users', ensureAuthenticated, usersController.update.bind(usersController));
app.get('/users', ensureAuthenticated, usersController.list);

app.get('/stations', stationController.list);
app.get('/stations/mine', ensureAuthenticated, stationController.listByUser.bind(stationController));
app.post('/stations', ensureAuthenticated, stationController.create.bind(stationController));
app.put('/stations', ensureAuthenticated, stationController.update.bind(stationController));
// app.delete('/stations', ensureAuthenticated, stationController.update);

app.get('/records', recordController.list);
app.get('/records/:station_id', recordController.list);
app.get('/records/last/:station_id', recordController.findLast);
app.post('/records', recordController.create);

app.get('/updateLogs', logsController.update);
app.get('/logs/:station_id/:reference_date_min/:reference_date_max', logsController.list);
app.get('/logs/:station_id/:reference_date_min/:reference_date_max/download', logsController.downloadCSV);

app.listen(3333, () => console.log('Server is listening on http://localhost:3333/'));
