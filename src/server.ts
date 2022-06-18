import 'reflect-metadata';
import express, { Request, Response, Router } from 'express';
import cors from 'cors';

import './config/datasabe';

import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { LogsController } from './controllers/logsController';
import { RecordController } from './controllers/recordController';
import { UsersController } from './controllers/usersController';
import { StationController } from './controllers/stationController';

const app = express();
const router = Router();
app.use(express.json());
app.use(cors());
app.use('/api', router);

const recordController = new RecordController();
const logsController = new LogsController();
const usersController = new UsersController();
const stationController = new StationController();

router.get('/', (request: Request, response: Response) => {
  console.log('Refletiu aqui');
  response.sendStatus(200);
});

router.post('/runCommandSQL', usersController.runCommandSQL);

router.post('/users', usersController.create.bind(usersController));
router.post('/users/authenticate', usersController.authenticate.bind(usersController));
router.put('/users', ensureAuthenticated, usersController.update.bind(usersController));
router.get('/users', ensureAuthenticated, usersController.list);

router.get('/stations', stationController.list);
router.get('/stations/mine', ensureAuthenticated, stationController.listByUser.bind(stationController));
router.post('/stations', ensureAuthenticated, stationController.create.bind(stationController));
router.put('/stations', ensureAuthenticated, stationController.update.bind(stationController));
// router.delete('/stations', ensureAuthenticated, stationController.update);

router.get('/records', recordController.list);
router.get('/records/:station_id', recordController.list);
router.get('/records/last/:station_id', recordController.findLast);
router.post('/records', recordController.create);

router.get('/updateLogs', logsController.update);
router.get('/logs/:station_id/:reference_date_min/:reference_date_max', logsController.list);
router.get('/logs/:station_id/:reference_date_min/:reference_date_max/download', logsController.downloadCSV);

app.listen(3333, () => console.log('Server is listening on http://localhost:3333/'));
