import { createConnection, getConnectionOptions } from 'typeorm';

getConnectionOptions().then((options) => {
  createConnection({
    ...options,
  });
});
