/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv'
import { HttpError } from './middleware/errorMiddleware';
import { WebServiceClient } from '@maxmind/geoip2-node';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
dotenv.config();

const acount = process.env.ACCOUNT_SID ?? 'default_value';
const apiKey = process.env.API_KEY ?? 'default_value';

const client = new WebServiceClient(acount,apiKey,{ host: 'geolite.info'}
)

app.get('/user-location', async (_req: Request, res: Response) => {
  const ipAddress = '66.15.224.255';
  const response = await client.city(ipAddress);
  const locationData = {
    ip: response.traits?.ipAddress,
    continentCode: response.continent?.code,
    continentName: response.continent?.names.en,
    countryCode: response.country?.isoCode,
    countryName: response.country?.names.en,
    mobileCountryCode: response.traits?.mobileCountryCode || null,
    isInEu: response.registeredCountry?.isInEuropeanUnion,
    city: response.city?.names.en || null,
    latitude: response.location?.latitude,
    longitude: response.location?.longitude,
    postalCode: response.postal?.code || null,
    timezone: response.location?.timeZone,
    populationDensity: response.location?.populationDensity ||null
  };
  res.json(locationData);
});

app.use(() => {
  throw new HttpError(404, 'Route Not found');
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});
export default app;
