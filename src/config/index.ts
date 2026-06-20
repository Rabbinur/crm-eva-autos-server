import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const cors_origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const envConfig = {
  app: {
    port: process.env.PORT ? Number(process.env.PORT) : 5005,
    env: process.env.NODE_ENV as "development" | "production",
  },
  clients: {
    admin_dev: process.env.ADMIN_CLIENT_URL_DEV as string,
    admin_prod: process.env.ADMIN_CLIENT_URL_PROD as string,
    public_dev: process.env.PUBLIC_CLIENT_URL_DEV as string,
    public_prod: process.env.PUBLIC_CLIENT_URL_PROD as string,
  },
  cors_origins,
  database: {
    mongodb_url: process.env.MONGODB_URL as string,
    new_mongodb_url: process.env.NEW_MONGODB_URL as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    access_token_expires: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    refresh_token_expires: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    access_cookie_name:
      process.env.ACCESS_TOKEN_COOKIE_NAME || "munchhub_auth_access_token",
    refresh_cookie_name:
      process.env.REFRESH_TOKEN_COOKIE_NAME || "munchhub_auth_refresh_token",
  },
  aws: {
    access_key_id: process.env.AWS_ACCESS_KEY_ID!,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_DEFAULT_REGION!,
    bucket: process.env.AWS_BUCKET!,
    use_path_style_endpoint: process.env.AWS_USE_PATH_STYLE_ENDPOINT,
    file_load_base: process.env.AWS_FILE_LOAD_BASE!,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    success_url: process.env.STRIPE_SUCCESS_URL!,
    cancel_url: process.env.STRIPE_CANCEL_URL!,
  },
  google: {
    app_user: process.env.APP_USER as string,
    app_pass: process.env.APP_PASSWORD as string,
  },
  doordash: {
    developer_id: process.env.DOORDASH_DEVELOPER_ID as string,
    key_id: process.env.DOORDASH_KEY_ID as string,
    signin_secret: process.env.DOORDASH_SIGNING_SECRET as string,
    base_api: process.env.DOORDASH_BASE_API as string,
    webhook_token: process.env.DOORDASH_WEBHOOK_BEARER_TOKEN as string,
  },
  email: {
    host: process.env.MAIL_HOST as string,
    port: Number(process.env.MAIL_PORT) as number,
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
  },
  redis: {
    password: process.env.REDIS_PASSWORD as string,
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as string,
    url: process.env.REDIS_URL as string,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL as string,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};
