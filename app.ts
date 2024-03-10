/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from 'express';
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

const client = new WebServiceClient(
  acount, apiKey  ,
  { host: 'geolite.info' }
)

app.get('/user-location', async (req: Request, res: Response) => {
  
  const ipAddress = '196.207.143.83';
  console.log(client)
  const response = await client.city(ipAddress);
  console.log(response);
  const locationData = {
    ip: ipAddress,
    continent_code: response.continent?.code,
    continent_name: response.continent?.names.en,
    country_code: response.country?.isoCode,
    country_name: response.country?.names.en,
    isInEu: response.registeredCountry?.isInEuropeanUnion,
    city: response.city?.names.en,
    latitude: response.location?.latitude,
    longitude: response.location?.longitude,
    postalCode: response.postal?.code || null,
    timezone: response.location?.timeZone,
  };
  res.json(locationData);

});

app.use((req, res, next) => {
  throw new HttpError(404, 'Route Not found');
});

app.use((error: Error, req: Request, res: Response ) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
