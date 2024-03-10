import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
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

const client = new WebServiceClient(acount, apiKey, { host: 'geolite.info' });

interface LocationData {
  ip?: string ;
  continentCode: string | null;
  continentName: string | null;
  countryCode: string  | null;
  countryName: string  | null;
  mobileCountryCode: string | null;
  isInEu: boolean | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  postalCode?: string ;
  timezone?: string ;
  populationDensity?: number;
}

app.get<
string, 
Record<string, never>, 
LocationData, 
Record<string, never>, 
Record<string, never>>(
  '/user-location',
  async (req, res) => {
    const ipAddress = req.ip!;
    const response = await client.city(ipAddress);
    if (!response) {
      throw new HttpError(500, 'Failed to retrieve location data');
    }
    const locationData = {
      ip: response.traits?.ipAddress,
      continentCode: response.continent?.code ?? null,
      continentName: response.continent?.names.en ?? null,
      countryCode: response.country?.isoCode ?? null,
      countryName: response.country?.names.en ?? null,
      mobileCountryCode: response.traits?.mobileCountryCode ?? null,
      isInEu: response.registeredCountry?.isInEuropeanUnion ?? null,
      city: response.city?.names.en ?? null,
      latitude: response.location?.latitude ?? null,
      longitude: response.location?.longitude ?? null,
      postalCode: response.postal?.code ,
      timezone: response.location?.timeZone ,
      populationDensity: response.location?.populationDensity ,
    };
    
    res.json(locationData);
  }
);

app.use(() => {
  throw new HttpError(404, 'Route Not found');
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
