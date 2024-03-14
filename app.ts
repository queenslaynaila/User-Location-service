import express, { Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import databaseConfig from './rateLimit';
import { HttpError } from './middleware/errorMiddleware';
import { WebServiceClient } from '@maxmind/geoip2-node';


const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
dotenv.config();
app.set('trust proxy', true);


const account = process.env.ACCOUNT_SID ?? 'default_value';
const apiKey = process.env.API_KEY ?? 'default_value';
const geoLocationClient = new WebServiceClient(account, apiKey, { host: 'geolite.info' });

interface LocationData {
  ip?: string;
  countryCode: string | null;
}

const rateLimiter = rateLimit({
  windowMs: databaseConfig.rateLimit.windowMs,
  max: databaseConfig.rateLimit.max,
  message: databaseConfig.rateLimit.errorMessage,
});

app.use('/user-location', rateLimiter);

app.get<string, Record<string, never>, LocationData, Record<string, never>, Record<string, never>>(
  '/user-location',
  async (req, res) => {
    const clientIpAddress = req.ip!;
    const response = await geoLocationClient.country(clientIpAddress);
    if (!response) {
      throw new HttpError(500, 'Failed to retrieve location data');
    }
    const locationData: LocationData = {
      ip: response.traits?.ipAddress,
      countryCode: response.country?.isoCode ?? null,
    };
    res.json(locationData);
  }
);

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
