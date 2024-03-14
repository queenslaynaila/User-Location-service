import { Router } from 'express';
import { sql } from './../db';
import { HttpError } from '../middleware/errorMiddleware';

const SQL_GET_COUNTRY_CODE = sql<{ network: string; }, { country_code: string }>(`
    SELECT
    country_iso_code as country_name,
    FROM
        geoip2_location
    INNER JOIN
        geoip2_network ON geoip2_network.geoname_id = geoip2_location.geoname_id
    WHERE
        network >>= :network
`);


interface LocationData {
  country_code: string 
}

export default (router: Router) => {
  router.get<string,Record<string, never>,LocationData,Record<string, never>,Record<string, never>>(
    '/user-location',
    async (req, res) => {
      const forwardedForHeader = req.headers['x-forwarded-for']! as string;
      const ipAddresses = forwardedForHeader.split(',');
      const realIpAddress = ipAddresses[0].trim();
      const  country_code  = await SQL_GET_COUNTRY_CODE({network: realIpAddress})
        .one(new HttpError(500, 'Failed to get country code'));
      res.json(country_code);
    }
  );
};
