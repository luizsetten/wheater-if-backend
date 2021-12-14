import { RecordController } from './controllers/recordController';
import express, { Request, Response } from 'express';
import "reflect-metadata";
import './config/datasabe';
import { LogsController } from './controllers/logsController';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const recordController = new RecordController()
const logsController = new LogsController()

app.get('/', (request: Request, response: Response) => {
  response.sendStatus(200);
});

app.get('/records', recordController.list);
app.get('/records/:station_id', recordController.list);

app.get('/records/last', recordController.findLast);

app.post('/records', recordController.create);

app.get('/updateLogs', logsController.update);
app.get('/logs/:station_id/:reference_date_min/:reference_date_max', logsController.list);
app.get('/logs/:station_id/:reference_date_min/:reference_date_max/download', logsController.downloadCSV);

app.listen(3333, () => console.log('Server is listening on http://localhost:3333/'));
