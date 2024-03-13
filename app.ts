import express, { Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { HttpError } from './middleware/errorMiddleware';
import rateLimit from 'express-rate-limit';
import databaseConfig from './config';
import getLocation from './routes/location'

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: databaseConfig.rateLimit.windowMs,
  max: databaseConfig.rateLimit.max,
  message: databaseConfig.rateLimit.message,
});

getLocation(app);

app.use(limiter);

app.use(() => {
  throw new HttpError(404, 'Route Not found');
});

app.use((error: Error, req: Request, res: Response) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
