const databaseConfig = {
  dbFilePath: './GeoLite2-Country.mmdb',
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: 'Too many requests from this IP, please try again later',
  },
};
  
export default databaseConfig;
  
