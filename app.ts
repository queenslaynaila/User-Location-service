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

// interface LocationData {
//   ip?: string ;
//   countryCode: string  | null;
// }

app.get(
  '/user-location', 
  async (req, res) => {
    const forwardedIps = req.headers['x-forwarded-for']!as string;
    console.log(forwardedIps)
    console.log(typeof forwardedIps)
    const ipAddresses = forwardedIps.split(',');
    const firstIpAddress = ipAddresses[0].trim();
    const response = await client.country(firstIpAddress);
    if (!response) {
      throw new HttpError(500, 'Failed to retrieve location data');
    }
    const locationData = {
      ip: response.traits?.ipAddress,
      countryCode: response.country?.isoCode ?? null,
    };
    res.json(locationData);
  });


app.use(() => {
  throw new HttpError(404, 'Route Not found');
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error)
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  } 
  return res.status(500).json({ error: 'Internal Server Error' });
  
});

export default app;
