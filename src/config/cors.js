const allowedOrigins =  process.env.CORS_WHITELIST
  ? process.env.CORS_WHITELIST.split(",")
  : [];


export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
