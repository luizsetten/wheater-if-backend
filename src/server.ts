import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/', (request: Request, response: Response) => {
  response.send(200);
});

app.post('/', (request: Request, response: Response) => {
  console.log(request.body);

  response.send(200);
});

app.listen(3333, () => console.log('Server is listening on http://localhost:3333/'));
