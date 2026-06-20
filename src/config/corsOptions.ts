import { envConfig } from ".";
import cors from "cors";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log({ origin });
    if (!origin) return callback(null, true);
    console.log(envConfig.cors_origins);
    console.log({ isOriginIncludes: envConfig.cors_origins.includes(origin) });
    if (
      process.env.NODE_ENV === "development" ||
      envConfig.cors_origins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
