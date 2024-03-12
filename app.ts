import express, { Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import { Reader } from '@maxmind/geoip2-node';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const dbFilePath = './GeoLite2-Country.mmdb';
const readerPromise = Reader.open(dbFilePath);

interface LocationData {
  ip?: string ;
  countryCode: string  | null;
}

app.get<string, Record<string, never>, LocationData, Record<string, never>, Record<string, never>>(
  '/user-location', 
  async (req: Request, res: Response) => {
    const ipAddress = req.ip!
    const reader = await readerPromise;
    const response = reader.country(ipAddress);
    const locationData = {
      continent: response.continent?.names.en,
      country: response.country?.names.en
    };
    res.json(locationData);
  });


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
