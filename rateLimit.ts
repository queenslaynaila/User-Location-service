const databaseConfig = {
  dbFilePath: './GeoLite2-Country.mmdb',
  rateLimit: {
    windowMs: 60 * 60 * 1000, 
    max: 5,
    standardHeaders: true,
    message: 'Too many requests from this IP, please try again later',
  },
};
    
export default databaseConfig;
    