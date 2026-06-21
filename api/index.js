"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/index.ts
var import_dotenv, import_path, cors_origins, envConfig;
var init_config = __esm({
  "src/config/index.ts"() {
    "use strict";
    import_dotenv = __toESM(require("dotenv"));
    import_path = __toESM(require("path"));
    import_dotenv.default.config({ path: import_path.default.join(process.cwd(), ".env") });
    cors_origins = (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
    envConfig = {
      app: {
        port: process.env.PORT ? Number(process.env.PORT) : 5005,
        env: process.env.NODE_ENV
      },
      clients: {
        admin_dev: process.env.ADMIN_CLIENT_URL_DEV,
        admin_prod: process.env.ADMIN_CLIENT_URL_PROD,
        public_dev: process.env.PUBLIC_CLIENT_URL_DEV,
        public_prod: process.env.PUBLIC_CLIENT_URL_PROD
      },
      cors_origins,
      database: {
        mongodb_url: process.env.MONGODB_URL,
        new_mongodb_url: process.env.NEW_MONGODB_URL
      },
      jwt: {
        secret: process.env.JWT_SECRET,
        access_token_expires: process.env.ACCESS_TOKEN_EXPIRES_IN,
        refresh_token_expires: process.env.REFRESH_TOKEN_EXPIRES_IN,
        access_cookie_name: process.env.ACCESS_TOKEN_COOKIE_NAME || "munchhub_auth_access_token",
        refresh_cookie_name: process.env.REFRESH_TOKEN_COOKIE_NAME || "munchhub_auth_refresh_token"
      },
      aws: {
        access_key_id: process.env.AWS_ACCESS_KEY_ID,
        secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION,
        bucket: process.env.AWS_BUCKET,
        use_path_style_endpoint: process.env.AWS_USE_PATH_STYLE_ENDPOINT,
        file_load_base: process.env.AWS_FILE_LOAD_BASE
      },
      stripe: {
        secret_key: process.env.STRIPE_SECRET_KEY,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL
      },
      google: {
        app_user: process.env.APP_USER,
        app_pass: process.env.APP_PASSWORD
      },
      doordash: {
        developer_id: process.env.DOORDASH_DEVELOPER_ID,
        key_id: process.env.DOORDASH_KEY_ID,
        signin_secret: process.env.DOORDASH_SIGNING_SECRET,
        base_api: process.env.DOORDASH_BASE_API,
        webhook_token: process.env.DOORDASH_WEBHOOK_BEARER_TOKEN
      },
      email: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      redis: {
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        url: process.env.REDIS_URL,
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN
      }
    };
  }
});

// src/events/eventEmitter.ts
var import_eventemitter2, Event, emitter;
var init_eventEmitter = __esm({
  "src/events/eventEmitter.ts"() {
    "use strict";
    import_eventemitter2 = require("eventemitter2");
    Event = class extends import_eventemitter2.EventEmitter2 {
      on(event, listener) {
        console.log(
          `[EventEmitter] Listener registered for event: "${String(event)}"`
        );
        return super.on(event, listener);
      }
    };
    emitter = new Event();
  }
});

// src/modules/aws/uploader.ts
var import_client_s3, import_crypto, import_path2, Service6, AWSFileUploader;
var init_uploader = __esm({
  "src/modules/aws/uploader.ts"() {
    "use strict";
    init_config();
    import_client_s3 = require("@aws-sdk/client-s3");
    import_crypto = require("crypto");
    import_path2 = __toESM(require("path"));
    Service6 = class {
      bucketName = envConfig.aws.bucket;
      region = envConfig.aws.region;
      accessKeyId = envConfig.aws.access_key_id;
      secretAccessKey = envConfig.aws.secret_access_key;
      upload_base = envConfig.aws.file_load_base;
      rootFolder = "zsi-restaurant";
      s3Client = new import_client_s3.S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey
        }
      });
      getPublicUrl(key) {
        return `${this.upload_base}/${key}`;
      }
      async uploadFileToS3(file, folder) {
        const fileExt = import_path2.default.extname(file.originalname).toLowerCase();
        const fileName = `${Date.now()}-${(0, import_crypto.randomUUID)()}${fileExt}`;
        const key = `${this.rootFolder}/${folder}/${fileName}`;
        const command = new import_client_s3.PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        });
        await this.s3Client.send(command);
        return this.getPublicUrl(key);
      }
      async uploadSingleFile(file, folder) {
        return await this.uploadFileToS3(file, folder);
      }
      async uploadMultipleFiles(files, folder) {
        const uploadPromises = files.map(
          (file) => this.uploadFileToS3(file, folder)
        );
        return await Promise.all(uploadPromises);
      }
      async deleteFileFromS3(key) {
        console.log(`[AWS S3] Deleting file with key: ${key}`);
        try {
          const command = new import_client_s3.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
          });
          await this.s3Client.send(command);
          console.log(`[AWS S3] Successfully Deleted file with key: ${key}`);
        } catch (error) {
          console.error(`[AWS S3] Error deleting file: ${key}`, error?.message);
        }
      }
      async deleteMultipleFilesFromS3(keys) {
        console.log(`[AWS S3] Deleting files with keys: ${keys.join(", ")}`);
        try {
          const command = new import_client_s3.DeleteObjectsCommand({
            Bucket: this.bucketName,
            Delete: {
              Objects: keys.map((key) => ({ Key: key })),
              Quiet: false
            }
          });
          await this.s3Client.send(command);
          console.log(
            `[AWS S3] Successfully Deleted files with keys: ${keys.join(", ")}`
          );
        } catch (error) {
          console.error(
            `[AWS S3] Error deleting files: ${keys.join(", ")}`,
            error?.message
          );
        }
      }
      extractS3KeyFromUrl(url) {
        try {
          const parsedUrl = new URL(url);
          if (!parsedUrl.href.startsWith(this.upload_base)) {
            throw new Error("Invalid S3 URL: does not match base URL");
          }
          return parsedUrl.pathname.replace(/^\//, "").replace(this.upload_base.replace(/^https?:\/\//, "") + "/", "");
        } catch {
          throw new Error(`Invalid URL: ${url}`);
        }
      }
      async deleteSingleFile(url) {
        const key = this.extractS3KeyFromUrl(url);
        await this.deleteFileFromS3(key);
      }
      async deleteMultipleFiles(urls) {
        const keys = urls.map((url) => this.extractS3KeyFromUrl(url));
        await this.deleteMultipleFilesFromS3(keys);
      }
      async uploadMenuCategoryImage(file) {
        const folder = "menu-categories";
        return await this.uploadFileToS3(file, folder);
      }
      async uploadMenuItemFiles(thumbnail, slider_images) {
        const folder = "menu-items";
        const thumbnailUrl = await this.uploadFileToS3(thumbnail, folder);
        const sliderUrls = [];
        for (const image of slider_images) {
          const url = await this.uploadFileToS3(image, folder);
          sliderUrls.push(url);
        }
        return {
          thumbnail: thumbnailUrl,
          slider_images: sliderUrls
        };
      }
      async uploadRestaurantLogo(logo) {
        return await this.uploadSingleFile(logo, "assets");
      }
      async uploadRestaurantBanner(banner) {
        return await this.uploadSingleFile(banner, "assets");
      }
    };
    AWSFileUploader = new Service6();
  }
});

// src/events/aws-s3.event.ts
var require_aws_s3_event = __commonJS({
  "src/events/aws-s3.event.ts"() {
    "use strict";
    init_uploader();
    init_eventEmitter();
    emitter?.on("s3.files.deleted", async (urls) => {
      console.log(`\u2705 AWS S3 Event received files.deleted event.`);
      await AWSFileUploader.deleteMultipleFiles(urls);
    });
    emitter?.on("s3.file.deleted", async (url) => {
      console.log(`\u2705 AWS S3 Event received files.deleted event.`);
      await AWSFileUploader.deleteSingleFile(url);
    });
  }
});

// src/events/logger.event.ts
var require_logger_event = __commonJS({
  "src/events/logger.event.ts"() {
    "use strict";
    var import_fs = __toESM(require("fs"));
    var import_path4 = __toESM(require("path"));
    init_eventEmitter();
    emitter.on("apiLog", async (logData) => {
      const logsDir = import_path4.default.join(__dirname, "../../logs");
      const logFilePath = import_path4.default.join(
        logsDir,
        `api_data_logger_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.log`
      );
      try {
        await import_fs.default.promises.mkdir(logsDir, { recursive: true });
        await import_fs.default.promises.appendFile(logFilePath, JSON.stringify(logData) + "\n");
      } catch (err) {
        console.error("Error writing to log file:", err);
      }
    });
  }
});

// src/events/index.ts
var require_events = __commonJS({
  "src/events/index.ts"() {
    "use strict";
    var import_aws_s3 = __toESM(require_aws_s3_event());
    var import_logger2 = __toESM(require_logger_event());
  }
});

// src/app.ts
var import_dotenv3 = __toESM(require("dotenv"));
var import_express19 = __toESM(require("express"));

// src/middlewares/globalErrorHandler.ts
var import_zod = require("zod");
var import_mongoose = __toESM(require("mongoose"));

// src/middlewares/error.ts
var ApiError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var error_default = ApiError;

// src/lib/httpStatus.ts
var import_http_status = __toESM(require("http-status"));
var HttpStatusCode = import_http_status.default;

// src/middlewares/globalErrorHandler.ts
var import_multer = __toESM(require("multer"));
var ErrorHandler = class {
  statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  message = "Something went wrong";
  errorMessages = [];
  constructor() {
  }
  // catch zod validation error
  handleZodValidationError(error) {
    const errors = error.issues.map(
      (issue) => {
        if (issue.code === "unrecognized_keys" && issue.keys) {
          const keys = issue.keys;
          return {
            path: issue?.path[issue.path.length - 1] || "body",
            message: `The field(s) ${keys.map((key) => `'${key}'`).join(", ")} are not allowed.`
          };
        }
        if (issue.code === "custom" && issue.message === "At least one field is required") {
          return {
            path: issue?.path[issue.path.length - 1] || "body",
            message: "Please provide at least one field to update."
          };
        }
        return {
          path: issue?.path[issue.path.length - 1] || "body",
          message: issue?.message
        };
      }
    );
    this.statusCode = HttpStatusCode.BAD_REQUEST;
    this.message = "Validation Error";
    this.errorMessages = errors;
  }
  // catch api errors
  handleApiError(error) {
    this.statusCode = error?.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    this.message = error.message || "Something went wrong";
    this.errorMessages = error?.message ? [
      {
        path: "",
        message: error.message
      }
    ] : [];
  }
  // handle generic error
  handleGenericError(error) {
    this.message = error?.message || "Something went wrong";
    this.errorMessages = error?.message ? [
      {
        path: "",
        message: error.message
      }
    ] : [];
  }
  // handle mongodb objectId cast/invalid error
  handleCastError(error) {
    const errors = [
      {
        path: error.path,
        message: "Invalid id!"
      }
    ];
    this.errorMessages = errors;
    this.statusCode = HttpStatusCode.BAD_REQUEST;
    this.message = `Invalid MongoDB ObjectId`;
  }
  // handle mongoose validation error
  handleMongodbValidationError(error) {
    const errors = Object.values(error.errors).map(
      (el) => {
        return {
          path: el?.path,
          message: el?.message
        };
      }
    );
    this.statusCode = HttpStatusCode.BAD_REQUEST;
    this.errorMessages = errors;
    this.message = "Validation Error!";
  }
  // handle multer file size error
  handleMulterError(error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      this.statusCode = HttpStatusCode.BAD_REQUEST;
      this.message = "Image exceeds 5MB size limit. Please upload a smaller file.";
      this.errorMessages = [
        {
          path: "file",
          message: "Image exceeds 5MB size limit."
        }
      ];
    } else {
      this.statusCode = HttpStatusCode.BAD_REQUEST;
      this.message = error.message || "File upload error.";
      this.errorMessages = [
        {
          path: "file",
          message: error.message
        }
      ];
    }
  }
  globalErrorHandler = (error, req, res, next) => {
    if (error instanceof import_zod.ZodError) {
      this.handleZodValidationError(error);
    } else if (error instanceof error_default || error?.constructor?.name === "ApiError" || error?.statusCode && typeof error.statusCode === "number") {
      this.handleApiError(error);
    } else if (error instanceof import_multer.default.MulterError) {
      this.handleMulterError(error);
    } else if (error instanceof import_mongoose.default.Error.CastError) {
      this.handleCastError(error);
    } else if (error instanceof import_mongoose.default.Error.ValidationError) {
      this.handleMongodbValidationError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    }
    res.status(this.statusCode).json({
      statusCode: this.statusCode,
      success: false,
      message: this.message,
      traceId: req.traceId || null,
      errorMessages: this.errorMessages,
      stack: process.env.NODE_ENV !== "production" ? error.stack : void 0
    });
  };
};
var globalErrorHandler_default = new ErrorHandler();

// src/routes/index.ts
var import_express17 = __toESM(require("express"));

// src/modules/admin/admin.route.ts
var import_express = require("express");

// src/modules/admin/admin.model.ts
var import_mongoose2 = require("mongoose");

// src/utils/schemaOptions.ts
var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false
  }
};

// src/modules/admin/admin.model.ts
var adminSchema = new import_mongoose2.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    designation: {
      type: String
    },
    bio: {
      type: String
    },
    role: {
      type: String,
      default: "admin"
    },
    image: {
      type: String
    },
    status: {
      type: String,
      enum: ["inactive", "admin_approval", "active"],
      default: "inactive"
    },
    phone_number: {
      type: String,
      default: null
    },
    driving_license: {
      type: String,
      default: null
    },
    work_place: {
      type: String,
      default: null
    },
    date_of_birth: {
      type: Date,
      default: null
    }
  },
  schemaOptions
);
var AdminModel = (0, import_mongoose2.model)("Admin", adminSchema);

// src/config/redis.ts
var import_redis = require("@upstash/redis");
init_config();
var pubClient = new import_redis.Redis({
  url: envConfig.redis.upstashUrl || "https://placeholder-url.upstash.io",
  token: envConfig.redis.upstashToken || "placeholder-token"
});
var connectRedis = async () => {
  try {
    console.log("\u23F3 Upstash Redis database connecting...");
    const pong = await pubClient.ping();
    if (pong === "PONG") {
      console.log("\u2705 Upstash Redis cache database connected");
    } else {
      console.warn(`\u26A0\uFE0F Unexpected Upstash Redis ping response: ${pong}`);
    }
  } catch (error) {
    console.error(
      `Failed to connect to Upstash Redis. Error: ${error?.message}`
    );
  }
};

// src/config/email.ts
init_config();
var import_nodemailer = __toESM(require("nodemailer"));
var Mail = class {
  async sendEmail(subject, to, htmlContent, bcc, cc) {
    const port = Number(envConfig.email.port);
    const secure = port === 465;
    const transporter = import_nodemailer.default.createTransport({
      host: envConfig.email.host,
      port: port,
      secure: secure,
      auth: {
        user: envConfig.email.user,
        pass: envConfig.email.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    const mailOptions = {
      from: `kamrul's <${envConfig.email.user}>`,
      to,
      subject,
      html: htmlContent
    };
    if (bcc) {
      mailOptions.bcc = bcc;
    }
    if (cc) {
      mailOptions.cc = cc;
    }
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[EmailService] \u2705 Email sent to:${to}, MailId:${info.messageId}`
      );
    } catch (error) {
      console.error(`[EmailService] \u274C Failed: ${error.message}`);
      throw new error_default(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to send email. Please try again later."
      );
    }
  }
};
var MailService = new Mail();

// src/email-templates/verification.otp.ts
init_config();
var Templates = class {
  wrapper(content) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937; margin: 0; line-height: 1.6;">
        <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Navy Blue Gradient Header -->
          <div style="background: linear-gradient(135deg, #0a192f 0%, #172a45 100%); padding: 35px 30px; text-align: center; border-bottom: 3px solid #ef1f26;">
            <!-- Company Logo Area -->
            <div style="margin-bottom: 5px;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; font-family: sans-serif;">
                \u{1F37D}\uFE0F Kamrul's<span style="color: #ef1f26;">HUB</span>
              </span>
              <div style="font-size: 10px; color: #8892b0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-top: 4px;">
                Distributor Network
              </div>
            </div>
          </div>

          <!-- Body Content Wrapper -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            ${content}
          </div>

          <!-- Support & Security Section -->
          <div style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
              Need help? Contact our distributor support team at 
              <a href="mailto:rabbinur.cse.bubt@gmail.com" style="color: #ef1f26; text-decoration: none; font-weight: 600;">support@munchhub.com</a>
            </p>
          </div>

          <!-- Footer Links & Branding -->
          <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #9ca3af; background-color: #f9fafb;">
            <div style="margin-bottom: 15px;">
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Terms of Service</a> | 
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Support</a>
            </div>
            <p style="margin: 0;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Kamrul Hub. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #d1d5db;">This is an automated operational email from kamrul's Distributor CRM.</p>
          </div>
        </div>
      </div>
    `;
  }
  generateOTPVerification(data) {
    const { name, otp, purpose, expires_in_minutes = 2 } = data;
    const title = purpose ? `OTP for ${purpose}` : `OTP Verification`;
    const content = `
      <!-- Verification Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; border: 1px solid #a7f3d0; text-align: center;">
          \u{1F512} SECURE VERIFICATION CODE
        </span>
      </div>

      <h3 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700; text-align: center;">Hello, ${name}</h3>
      <p style="color: #4b5563; font-size: 14px; text-align: center; margin-bottom: 30px; line-height: 1.5;">
        You requested a verification code to complete your <strong>${purpose || "account action"}</strong>. Please use the secure code below:
      </p>

      <!-- Modern OTP Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
          Your One-Time Password
        </div>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; color: #0f172a; margin: 10px 0; display: inline-block; text-align: center;">
          ${otp}
        </div>
        <div style="font-size: 12px; color: #ef1f26; font-weight: 500; margin-top: 10px;">
          \u23F3 Valid for ${expires_in_minutes} minutes
        </div>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">
        For security, do not share this code with anyone, including kamrul's staff.
      </p>
    `;
    return { html: this.wrapper(content), subject: title };
  }
  async accountVerificationOtp(data) {
    const { html, subject } = this.generateOTPVerification({
      ...data,
      purpose: "Account Verification"
    });
    await MailService.sendEmail(subject, data.email, html);
  }
  async resetPasswordVerificationOtp(data) {
    const { html, subject } = this.generateOTPVerification({
      ...data,
      purpose: "Password Reset"
    });
    await MailService.sendEmail(subject, data.email, html);
  }
  async sendAccountApprovalEmail(name, email) {
    const adminDashboard = envConfig.app.env === "development" ? envConfig.clients.admin_dev : envConfig.clients.admin_prod;
    const subject = "Your Admin Account Has Been Approved";
    const content = `
      <!-- Verification Badge / Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; border: 1px solid #a7f3d0; text-align: center;">
          \u2705 ACCOUNT ACTIVATED
        </span>
      </div>

      <h3 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700; text-align: center;">Congratulations, ${name}!</h3>
      
      <p style="color: #4b5563; font-size: 14px; text-align: center; margin-bottom: 30px; line-height: 1.6;">
        Your administrator account has been successfully approved by the system administration team. You now have full access to manage the kamrul's distributor portal.
      </p>

      <!-- Professional CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${adminDashboard}" style="background-color: #ef1f26; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
          Launch Admin Dashboard
        </a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 25px;">
        You can bookmark this dashboard link for easy future access.
      </p>
    `;
    const html = this.wrapper(content);
    await MailService.sendEmail(subject, email, html);
  }
};
var OTPEmailTemplates = new Templates();

// src/modules/otp/otp.service.ts
var Service = class {
  async sendAccountVerificationOtp(name, email, account_type) {
    const isExist = await pubClient.get(`otp:${email}`);
    if (isExist) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "We've already sent an OTP to your email. Please check your email and verify your account"
      );
    }
    if (account_type === "admin") {
      const admin = await AdminModel.findOne({ email });
      if (admin) {
        if (admin.status === "active" /* ACTIVE */) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            "Your account already activated"
          );
        }
        if (admin.status === "admin_approval" /* ADMIN_APPROVAL */) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            "Your account already verified and still under approval stage. Please wait until your account approved and activated"
          );
        }
      }
    }
    const otp = await this.generateOtp();
    await pubClient.set(`otp:${email}`, otp.toString(), { ex: 120 });
    console.log(
      `A new account registered. New otp ${otp} has been sent to ${email}`
    );
    try {
      await OTPEmailTemplates.accountVerificationOtp({ name, email, otp });
    } catch (error) {
      await pubClient.del(`otp:${email}`);
      throw error;
    }
  }
  async verifyOTP(email, otp) {
    const storedOtp = await pubClient.get(`otp:${email}`);
    if (!storedOtp) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your otp verification time has been expired. Please resend otp"
      );
    }
    if (Number(storedOtp) !== Number(otp)) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your provided otp was wrong. Please try with correct otp"
      );
    }
    await pubClient.del(`otp:${email}`);
  }
  async sendForgetPasswordOtp(name, email) {
    const isExist = await pubClient.get(`otp:${email}`);
    if (isExist) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "We've already sent an OTP to your email. Please check your email and verify your account"
      );
    }
    const otp = await this.generateOtp();
    await pubClient.set(`otp:${email}`, otp.toString(), { ex: 120 });
    try {
      await OTPEmailTemplates.accountVerificationOtp({ name, email, otp });
    } catch (error) {
      await pubClient.del(`otp:${email}`);
      throw error;
    }
  }
  async generateOtp() {
    return Math.floor(1e5 + Math.random() * 9e5);
  }
};
var OTPService = new Service();

// src/modules/users/users.model.ts
var import_mongoose3 = require("mongoose");

// src/constants/roles.ts
var ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  CHEF: "chef",
  WAITER: "waiter",
  CASHIER: "cashier",
  CUSTOMER: "customer",
  DELIVERYMAN: "deliveryman",
  MODERATOR: "moderator",
  CLIENT: "client"
};

// src/modules/users/users.enum.ts
var USER_STATUS = /* @__PURE__ */ ((USER_STATUS2) => {
  USER_STATUS2["ACTIVE"] = "active";
  USER_STATUS2["INACTIVE"] = "inactive";
  USER_STATUS2["BANNED"] = "banned";
  return USER_STATUS2;
})(USER_STATUS || {});
var AUTH_PROVIDERS = /* @__PURE__ */ ((AUTH_PROVIDERS3) => {
  AUTH_PROVIDERS3["GOOGLE"] = "google";
  AUTH_PROVIDERS3["FACEBOOK"] = "facebook";
  AUTH_PROVIDERS3["GITHUB"] = "github";
  AUTH_PROVIDERS3["EMAIL"] = "email";
  AUTH_PROVIDERS3["APPLE"] = "apple";
  AUTH_PROVIDERS3["TWITTER"] = "twitter";
  AUTH_PROVIDERS3["LINKEDIN"] = "linkedin";
  AUTH_PROVIDERS3["INSTAGRAM"] = "instagram";
  return AUTH_PROVIDERS3;
})(AUTH_PROVIDERS || {});

// src/modules/users/users.model.ts
var userSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, unique: true, index: true },
    phone_number: { type: String, default: null },
    profile_picture: { type: String, default: null },
    email: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER
    },
    is_verified: { type: Boolean, default: false },
    has_password: { type: Boolean, default: false },
    // id provider is email then password is required
    password: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.provider && this.provider === "email" /* EMAIL */) {
            return v != null && v.length > 0;
          }
          return true;
        },
        message: "Password is required for email registered users"
      }
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: "inactive" /* INACTIVE */
    },
    date_of_birth: { type: Date, default: null },
    driving_license: { type: String, default: null },
    work_place: { type: String, default: null },
    provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: "email" /* EMAIL */
    },
    gender: { type: String, enum: ["male", "female"], default: null },
    last_login_at: { type: Date, default: null }
  },
  schemaOptions
);
var UserModel = (0, import_mongoose3.model)("User", userSchema);

// src/lib/bcrypt.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var Bcrypt = class {
  async hash(password) {
    const hashedPassword = await import_bcryptjs.default.hash(password, 12);
    return hashedPassword;
  }
  async compare(password, encryptedPassword) {
    const isMatchedPassword = await import_bcryptjs.default.compare(password, encryptedPassword);
    return isMatchedPassword;
  }
};
var BcryptInstance = new Bcrypt();

// src/helpers/jwtHelper.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
init_config();
var JwtHelper = class {
  static createToken(payload, expireTime) {
    return import_jsonwebtoken.default.sign(payload, envConfig.jwt.secret, {
      expiresIn: expireTime
    });
  }
  static async generateTokens(data) {
    const access_token = this.createToken(
      data,
      envConfig.jwt.access_token_expires
    );
    const refresh_token = this.createToken(
      data,
      envConfig.jwt.refresh_token_expires
    );
    return { access_token, refresh_token };
  }
  static verifyToken(token) {
    try {
      return import_jsonwebtoken.default.verify(token, envConfig.jwt.secret);
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        throw new error_default(
          HttpStatusCode.UNAUTHORIZED,
          "Your session has expired. Please log in again to continue."
        );
      } else if (error?.name === "JsonWebTokenError") {
        throw new error_default(
          HttpStatusCode.UNAUTHORIZED,
          "Invalid token. Authentication failed."
        );
      } else if (error?.name === "NotBeforeError") {
        throw new error_default(
          HttpStatusCode.UNAUTHORIZED,
          "Token is not active yet. Please wait before retrying."
        );
      } else {
        throw new error_default(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred while verifying authentication."
        );
      }
    }
  }
};
var jwtHelper_default = JwtHelper;

// src/helpers/paginationHelpers.ts
var calculatePagination = (options) => {
  const page = Number(options?.page || 1);
  const limit = Number(options?.limit || 10);
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationHelpers = {
  calculatePagination
};

// src/modules/admin/admin.service.ts
var Service2 = class {
  async create(data) {
    console.log("[createAdmin] 1. Checking account existence for:", data.email);
    await this.isAlreadyHaveAnAccount(data.email);
    console.log("[createAdmin] 2. Hashing password");
    data.password = await BcryptInstance.hash(data.password);
    console.log("[createAdmin] 3. Sending account verification OTP");
    await OTPService.sendAccountVerificationOtp(data.name, data.email, "admin");
    console.log("[createAdmin] 4. Creating admin document in MongoDB");
    await AdminModel.create(data);
    console.log("[createAdmin] 5. Admin created successfully");
  }
  async resendVerificationOtp(email) {
    const isExist = await AdminModel.findOne({ email });
    if (!isExist) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }
    if (isExist?.status === "active") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    } else if (isExist?.status === "admin_approval") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is under admin approval. Please wait until you account approved"
      );
    }
    await OTPService.sendAccountVerificationOtp(
      isExist.name,
      isExist.email,
      "admin"
    );
  }
  async isAlreadyHaveAnAccount(email) {
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "You have already an account with this email. Please try to login"
      );
    } else {
      return;
    }
  }
  async adminLogin(email, password) {
    let userRecord = await AdminModel.findOne({ email });
    let isUserModel = false;
    if (!userRecord) {
      userRecord = await UserModel.findOne({ email });
      if (!userRecord) {
        throw new error_default(
          HttpStatusCode.NOT_FOUND,
          "The account you are trying to login does not exist in our system. Please create an account first"
        );
      }
      if (userRecord.role !== "admin" && userRecord.role !== "moderator") {
        throw new error_default(
          HttpStatusCode.FORBIDDEN,
          "Only admins and moderators are allowed to login to this panel"
        );
      }
      if (userRecord.status !== "active") {
        throw new error_default(
          400,
          "Your account is inactive. Please contact support to activate your account"
        );
      }
      isUserModel = true;
    } else {
      const accountStatus = userRecord.status;
      if (accountStatus === "inactive" /* INACTIVE */) {
        await OTPService.sendAccountVerificationOtp(
          userRecord.name,
          userRecord.email,
          "admin"
        );
        throw new error_default(
          400,
          "Your account is not verified yet. We've sent a verification email. Please verify to access your account"
        );
      }
      if (accountStatus === "admin_approval" /* ADMIN_APPROVAL */) {
        throw new error_default(
          400,
          "Your account is not approved yet. Please wait until admin approve your account"
        );
      }
    }
    const isPasswordMatched = await BcryptInstance.compare(
      password,
      userRecord.password
    );
    if (!isPasswordMatched) {
      throw new error_default(
        400,
        "Invalid credentials. Please try with valid credentials"
      );
    }
    return await this.generateLoginCredentials(userRecord._id, isUserModel);
  }
  async generateLoginCredentials(id, isUserModel = false) {
    let userObj;
    if (isUserModel) {
      userObj = await UserModel.findById(id).select({ password: 0 });
    } else {
      userObj = await AdminModel.findById(id).select({ password: 0 });
    }
    if (!userObj) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Account not found in our system."
      );
    }
    const payload = {
      id: userObj._id.toString(),
      email: userObj.email,
      role: userObj.role
    };
    const { access_token, refresh_token } = await jwtHelper_default.generateTokens(
      payload
    );
    await pubClient.set(`session:${userObj._id.toString()}`, "active", {
      ex: 604800
    });
    const responseUser = isUserModel ? {
      ...userObj.toObject(),
      image: userObj.profile_picture || "",
      profile_picture: userObj.profile_picture || ""
    } : {
      ...userObj.toObject(),
      profile_picture: userObj.image || ""
    };
    return {
      admin: responseUser,
      token: access_token,
      refresh_token
    };
  }
  async verifyAccount(email, otp) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "The account you are trying to login is not exist our system. Please create an admin account first"
      );
    }
    if (admin?.status === "active") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    } else if (admin?.status === "admin_approval") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is under admin approval. Please wait until you account approved"
      );
    }
    await OTPService.verifyOTP(email, otp);
    await AdminModel.updateOne(
      { email },
      { status: "admin_approval" /* ADMIN_APPROVAL */ }
    );
    return await this.generateLoginCredentials(admin._id);
  }
  async isAdminExist(email) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Admin account was not found"
      );
    }
    return admin;
  }
  async approveAdminAccount(email) {
    const isExist = await AdminModel.findOne({ email });
    if (!isExist) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "The admin account was not found!"
      );
    }
    if (isExist.status === "active" /* ACTIVE */) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "The admin account already approved and activated"
      );
    }
    await AdminModel.updateOne({ email }, { status: "active" /* ACTIVE */ });
    await OTPEmailTemplates.sendAccountApprovalEmail(
      isExist.name,
      isExist.email
    );
  }
  async getLoggedInAdmin(id) {
    const admin = await AdminModel.findById(id).select({ password: 0 });
    if (admin) {
      return {
        ...admin.toObject(),
        profile_picture: admin.image || ""
      };
    } else {
      const user = await UserModel.findById(id).select({ password: 0 });
      if (user) {
        return {
          ...user.toObject(),
          image: user.profile_picture || "",
          profile_picture: user.profile_picture || ""
        };
      }
    }
    return null;
  }
  async getAllAdmins(options, search_query) {
    const {
      limit = 5,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { email: { $regex: search_query, $options: "i" } },
        { designation: { $regex: search_query, $options: "i" } }
      ];
    }
    const result = await AdminModel.find({ ...searchCondition }).select({ password: 0 }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await AdminModel.countDocuments(searchCondition);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    };
  }
  async getAdminById(id) {
    return await AdminModel.findById(id).select({ password: 0 });
  }
  async getAdminByEmail(email) {
    return await AdminModel.findOne({ email }).select({ password: 0 });
  }
  async updateAdmin(id, data) {
    if (data.password) {
      delete data.password;
    }
    await AdminModel.findByIdAndUpdate(id, { ...data });
  }
  async deleteAdmin(id) {
    await AdminModel.findByIdAndDelete(id);
  }
  async changePassword(id, payload) {
    const isUserExist = await AdminModel.findById(id);
    if (!isUserExist) {
      throw new error_default(404, "Admin was not found");
    }
    const isPasswordMatched = await BcryptInstance.compare(
      payload.old_password,
      isUserExist.password
    );
    if (!isPasswordMatched) {
      throw new error_default(
        409,
        "Old password is incorrect. Please provide the correct old password"
      );
    }
    const isUnchangedPassword = await BcryptInstance.compare(
      payload.new_password,
      isUserExist.password
    );
    if (isUnchangedPassword) {
      throw new error_default(
        409,
        "Your provided old and new passwords are same. Please provide a different new password"
      );
    }
    const newPassword = await BcryptInstance.hash(payload?.new_password);
    await AdminModel.findByIdAndUpdate(id, {
      password: newPassword
    });
    await pubClient.del(`session:${id}`);
  }
  async resetPassword(data) {
    const isExist = await AdminModel.findOne({ email: data.email });
    if (!isExist) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Admin was not found!");
    }
    const newPassword = await BcryptInstance.hash(data.password);
    await AdminModel.findByIdAndUpdate(isExist._id, {
      password: newPassword
    });
    await pubClient.del(`session:${isExist._id.toString()}`);
  }
};
var AdminService = new Service2();

// src/shared/baseController.ts
var BaseController = class {
  catchAsync = (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
  sendResponse(req, res, data) {
    const responseData = {
      statusCode: data.statusCode,
      status_code: data.statusCode,
      // For legacy frontend compatibility
      success: data.success,
      message: data.message || null,
      traceId: req.traceId || null,
      data: data.data || null || void 0
    };
    res.status(data.statusCode).json(responseData);
  }
};
var baseController_default = BaseController;

// src/shared/pickQueries.ts
var pickQueries = (obj, keys) => {
  const queryObj = {};
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      queryObj[key] = obj[key];
    }
  }
  return queryObj;
};
var pickQueries_default = pickQueries;

// src/constants/paginationFields.ts
var paginationFields = [
  "page",
  "limit",
  "sortBy",
  "sortOrder"
];

// src/modules/users/users.service.ts
init_eventEmitter();

// src/modules/users/users.constants.ts
var userFilterableFields = ["role", "status"];
var userSearchableFields = [
  "name",
  "phone_number",
  "email",
  "role",
  "status"
];

// src/utils/id-generators.ts
var Service3 = class {
  userIDGenerator(role) {
    if (!role) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Role is required to generate user ID"
      );
    }
    const firstLetter = role.charAt(0).toUpperCase();
    const randomNumber = Math.floor(Math.random() * 9e5) + 1e5;
    const timestamp = Date.now().toString().slice(-5);
    return `MH${firstLetter}${randomNumber}${timestamp}`;
  }
  orderIDGenerator() {
    const randomNumber = Math.floor(Math.random() * 9e9) + 1e9;
    return `MHO-`.padEnd(7, "0") + randomNumber.toString();
  }
};
var IDGeneratorService = new Service3();

// src/lib/uuid.ts
var import_uuid = require("uuid");
var Service4 = class {
  /**
   * Generates a standard UUID v4.
   *
   * @example
   * ```ts
   * UUIDService.generateFull();
   * // "e7c51a77-95c0-4d61-9b09-65ac1a09f4f1"
   * ```
   *
   * @returns {string} A full UUID (e.g., "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
   */
  generateFull() {
    return (0, import_uuid.v4)();
  }
  /**
   * Generates and returns the first segment of a UUID.
   *
   * Useful for short unique identifiers such as temporary tokens or reference codes.
   *
   * @example
   * ```ts
   * UUIDService.generateFirstPart();
   * // "e7c51a77"
   * ```
   *
   * @returns {string} The first segment (before the first dash) of a UUID.
   */
  generateFirstPart() {
    return (0, import_uuid.v4)().split("-")[0];
  }
  /**
   * Generates and returns the last segment of a UUID.
   *
   * Useful for short but less predictable unique IDs.
   *
   * @example
   * ```ts
   * UUIDService.generateLastPart();
   * // "65ac1a09f4f1"
   * ```
   *
   * @returns {string} The last segment (after the last dash) of a UUID.
   */
  generateLastPart() {
    const parts = (0, import_uuid.v4)().split("-");
    return parts[parts.length - 1];
  }
  /**
   * Generates a UUID without any dashes.
   *
   * Useful for compact identifiers that still maintain UUID randomness.
   *
   * @example
   * ```ts
   * UUIDService.generateWithoutDash();
   * // "e7c51a7795c04d619b0965ac1a09f4f1"
   * ```
   *
   * @returns {string} A UUID string with all dashes removed.
   */
  generateWithoutDash() {
    return (0, import_uuid.v4)().replace(/-/g, "");
  }
  /**
   * Generates a custom-length UUID substring (without dashes).
   *
   * Useful for generating fixed-length unique codes like:
   * - Order IDs
   * - Reference numbers
   * - API keys
   *
   * @param {number} [length=8] - The desired length of the generated string.
   *
   * @example
   * ```ts
   * UUIDService.generateCustom();      // Default 8 characters
   * // "e7c51a77"
   *
   * UUIDService.generateCustom(12);    // Custom length
   * // "e7c51a7795c0"
   * ```
   *
   * @returns {string} A substring of the UUID (without dashes) of the given length.
   */
  generateCustom(length = 8) {
    return this.generateWithoutDash().slice(0, length);
  }
};
var UUIDService = new Service4();

// src/utils/generateUserName.ts
var generateUserName = (email) => {
  const cleanEmail = email.trim().replace(/.*<(.+)>.*/, "$1").toLowerCase();
  const uuidPart = UUIDService.generateFirstPart();
  const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-z0-9]/gi, "");
  const randomNum = Math.floor(1e3 + Math.random() * 9e3);
  return `${emailPrefix}${randomNum}${uuidPart}`;
};

// src/modules/users/users.service.ts
var Service5 = class {
  async create(data) {
    const isExist = await UserModel.findOne({
      email: data.email
    });
    if (isExist) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        `Already have an account with this email. Please login or create account with different email`
      );
    }
    if (data?.email) {
      data.username = generateUserName(data.email) ?? "";
    }
    data.user_id = IDGeneratorService.userIDGenerator(data.role);
    if (data.password) {
      data.password = await BcryptInstance.hash(data.password);
      data.has_password = true;
    }
    const user = await UserModel.create(data);
    return user;
  }
  async createFromGoogleAuth(data) {
    const isExist = await UserModel.findOne({
      email: data.email
    });
    if (isExist) {
      return isExist;
    }
    return await UserModel.create(data);
  }
  async createFromAppleAuth(data) {
    const isExist = await UserModel.findOne({
      email: data.email
    });
    if (isExist) {
      return isExist;
    }
    const payload = {
      name: data.name,
      username: generateUserName(data.name || ""),
      user_id: IDGeneratorService.userIDGenerator("client"),
      email: data.email,
      profile_picture: null,
      has_password: false,
      role: ROLES.CUSTOMER,
      status: "active" /* ACTIVE */,
      provider: "apple" /* APPLE */,
      is_verified: true
    };
    return await UserModel.create(payload);
  }
  async getLoggedInUser(id) {
    const user = await UserModel.findById(id).select({ password: 0 });
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found!");
    }
    if (user?.status === "banned" /* BANNED */) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account has been banned.  You can't access your account. Please contact to support team to activate your account"
      );
    }
    return user;
  }
  async getAllUsers(options, filters, search_query) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const { role, status: status2 } = filters;
    const andConditions = [];
    if (search_query) {
      andConditions.push({
        $or: userSearchableFields.map((field) => {
          return {
            [field]: {
              $regex: search_query,
              $options: "i"
            }
          };
        })
      });
    }
    if (role) {
      andConditions.push({
        role
      });
    }
    if (status2) {
      andConditions.push({
        status: status2
      });
    }
    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = await UserModel.find(whereConditions).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit).select({ password: 0 });
    const total = await UserModel.countDocuments(whereConditions);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    };
  }
  async changePassword(id, data) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found!");
    }
    if (!user.password) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "User does not have password to change. Please try to create/set password"
      );
    }
    const isPasswordMatched = await BcryptInstance.compare(
      data.old_password,
      user?.password
    );
    if (!isPasswordMatched) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your old password is wrong. Please provide your correct password"
      );
    }
    const isSamePassword = await BcryptInstance.compare(
      data.new_password,
      user.password
    );
    if (isSamePassword) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Same password couldn't be changed. Please provide a different password"
      );
    }
    const newPassword = await BcryptInstance.hash(data.new_password);
    await UserModel.findByIdAndUpdate(user._id, { password: newPassword });
  }
  async updateProfilePicture(id, profile_picture) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found!");
    }
    const result = await UserModel.findByIdAndUpdate(
      user._id,
      { profile_picture },
      { new: true }
    ).select({ password: 0 });
    if (user?.profile_picture) {
      console.log("[UserService] Delete old profile picture", user?.name);
      emitter.emit("s3.file.deleted", user?.profile_picture);
    } else {
      console.log(
        "[UserService] User has no old profile picture: ",
        user?.name
      );
    }
    return result;
  }
  async getUserByIdWithPassword(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }
  async getUserByIdWithoutPassword(id) {
    const user = await UserModel.findById(id).select({ password: 0 });
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }
  async getUserByDynamicKeyValue(key, value) {
    return await UserModel.findOne({ [key]: value });
  }
  async getUserByEmailOrPhoneNumber(credential) {
    return await UserModel.findOne({
      $or: [{ phone_number: credential }, { email: credential }]
    });
  }
  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }
  async getUserByIdWithSession(id, session) {
    return await UserModel.findById(id).session(session);
  }
  async getUserByEmail(email) {
    return await UserModel.findOne({ email });
  }
  async getUserByUserId(user_id) {
    return await UserModel.findOne({ user_id });
  }
  async updateUserById(id, data) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User not found");
    }
    if (data.password) {
      data.password = await BcryptInstance.hash(data.password);
    }
    const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true
    }).select({ password: 0 });
    return updatedUser;
  }
  async activateAccount(user_id) {
    const user = await UserModel.findOne({ user_id });
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User not found");
    }
    if (user.is_verified && user.status === "active") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "User account already activated & verified"
      );
    }
    return await UserModel.findByIdAndUpdate(
      user._id,
      {
        is_verified: true,
        status: "active" /* ACTIVE */
      },
      { new: true }
    );
  }
  async deleteAccount(id) {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return { id };
  }
  async setPassword(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    if (user.has_password) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "User already has a password. Please use change password to update your password"
      );
    }
    const hashedPassword = await BcryptInstance.hash(password);
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      has_password: true
    });
  }
};
var UserService = new Service5();

// src/modules/admin/admin.controller.ts
init_uploader();
var Controller = class extends baseController_default {
  createAdmin = this.catchAsync(async (req, res) => {
    await AdminService.create(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Your admin account has been created. We've sent a verification OTP to your email. Please check mailbox and verify your account",
      data: null
    });
  });
  resendVerificationOtp = this.catchAsync(
    async (req, res) => {
      await AdminService.resendVerificationOtp(req.body.email);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "We've sent a verification otp to your email. Please check the mailbox and verify the account",
        data: null
      });
    }
  );
  verifyAccount = this.catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const data = await AdminService.verifyAccount(email, otp);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your account has been verified successfully. Please wait until admin approve your account",
      data
    });
  });
  approveAdminAccount = this.catchAsync(async (req, res) => {
    const { email } = req.body;
    await AdminService.approveAdminAccount(email);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "The admin account has been activated successfully.",
      data: null
    });
  });
  adminLogin = this.catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const data = await AdminService.adminLogin(email, password);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "You've logged in successfully.",
      data
    });
  });
  getLoggedInAdmin = this.catchAsync(async (req, res) => {
    const data = await AdminService.getLoggedInAdmin(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Admin retrieved successfully.",
      data
    });
  });
  getAllAdmins = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const data = await AdminService.getAllAdmins(
      options,
      req.query.search_query
    );
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admins retrieved successfully",
      data
    });
  });
  getAdminById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await AdminService.getAdminById(id);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data
    });
  });
  getAdminByEmail = this.catchAsync(async (req, res) => {
    const email = req.params.email;
    const data = await AdminService.getAdminByEmail(email);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data
    });
  });
  updateAdmin = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await AdminService.updateAdmin(id, req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin updated successfully",
      data: null
    });
  });
  deleteAdmin = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await AdminService.deleteAdmin(id);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: null
    });
  });
  changePassword = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await AdminService.changePassword(id, req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your password has been changed successfully",
      data: null
    });
  });
  resetPassword = this.catchAsync(async (req, res) => {
    await AdminService.resetPassword(req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your password has been reset successfully",
      data: null
    });
  });
  updateLoggedInAdmin = this.catchAsync(async (req, res) => {
    const id = req.user?.id;
    const file = req.file;
    const updateData = { ...req.body };
    const admin = await AdminModel.findById(id);
    const user = !admin ? await UserModel.findById(id) : null;
    if (!admin && !user) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "User or Admin not found");
    }
    let profilePictureUrl = "";
    if (file) {
      profilePictureUrl = await AWSFileUploader.uploadSingleFile(
        file,
        "profile"
      );
    }
    if (admin) {
      if (profilePictureUrl) {
        if (admin.image) {
          try {
            await AWSFileUploader.deleteSingleFile(admin.image);
          } catch (err) {
            console.error("Error deleting old profile image:", err);
          }
        }
        updateData.image = profilePictureUrl;
      }
      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true
      }).select({ password: 0 });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedAdmin?.toObject(),
          profile_picture: updatedAdmin?.image || ""
        }
      });
    } else if (user) {
      if (profilePictureUrl) {
        if (user.profile_picture) {
          try {
            await AWSFileUploader.deleteSingleFile(user.profile_picture);
          } catch (err) {
            console.error("Error deleting old profile image:", err);
          }
        }
        updateData.profile_picture = profilePictureUrl;
      }
      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true
      }).select({ password: 0 });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedUser?.toObject(),
          image: updatedUser?.profile_picture || "",
          profile_picture: updatedUser?.profile_picture || ""
        }
      });
    }
  });
  changeLoggedInAdminPassword = this.catchAsync(
    async (req, res) => {
      const id = req.user?.id;
      const { current_password, new_password } = req.body;
      const admin = await AdminModel.findById(id);
      if (admin) {
        await AdminService.changePassword(id, {
          old_password: current_password,
          new_password
        });
      } else {
        await UserService.changePassword(id, {
          old_password: current_password,
          new_password
        });
      }
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your password has been changed successfully",
        data: null
      });
    }
  );
};
var AdminController = new Controller();

// src/modules/admin/admin.validate.ts
var import_zod2 = __toESM(require("zod"));
var create = import_zod2.default.object({
  body: import_zod2.default.object({
    name: import_zod2.default.string().min(1, "Name is required"),
    email: import_zod2.default.string().email("Invalid email address"),
    password: import_zod2.default.string().min(6, "Password must be at least 6 characters"),
    image: import_zod2.default.string().url("Invalid image URL").optional(),
    role: import_zod2.default.string().optional(),
    status: import_zod2.default.enum(["inactive", "admin_approval", "active"]).optional(),
    designation: import_zod2.default.string().optional(),
    bio: import_zod2.default.string().optional()
  })
});
var update = import_zod2.default.object({
  body: import_zod2.default.object({
    name: import_zod2.default.string().min(1).optional(),
    email: import_zod2.default.string().optional(),
    password: import_zod2.default.string().min(6).optional(),
    image: import_zod2.default.string().url().optional(),
    role: import_zod2.default.string().optional(),
    status: import_zod2.default.enum(["inactive", "admin_approval", "active"]).optional(),
    designation: import_zod2.default.string().optional(),
    bio: import_zod2.default.string().optional()
  })
});
var approveAccount = import_zod2.default.object({
  body: import_zod2.default.object({
    email: import_zod2.default.string({ required_error: "Email is required" }).email({ message: "Invalid email. Please provide a valid email" })
  })
});
var login = import_zod2.default.object({
  body: import_zod2.default.object({
    email: import_zod2.default.string({ required_error: "Email is required" }).email({ message: "Invalid email. Please provide a valid email" }),
    password: import_zod2.default.string({
      required_error: "Password must be provided"
    })
  })
});
var changePassword = import_zod2.default.object({
  body: import_zod2.default.object({
    old_password: import_zod2.default.string({
      required_error: "Old Password must be provided"
    }),
    new_password: import_zod2.default.string({
      required_error: "New Password must be provided"
    })
  })
});
var adminValidations = {
  create,
  update,
  approveAccount,
  login,
  changePassword
};

// src/modules/otp/otp.validate.ts
var import_zod3 = __toESM(require("zod"));
var resendOtp = import_zod3.default.object({
  body: import_zod3.default.object({
    email: import_zod3.default.string({ required_error: "Email is required" }).email("Invalid email format")
  })
});
var verifyOtp = import_zod3.default.object({
  body: import_zod3.default.object({
    email: import_zod3.default.string({ required_error: "Email is required" }).email({ message: "Invalid email. Please provide a valid email" }),
    otp: import_zod3.default.coerce.number({
      required_error: "otp must be provided",
      invalid_type_error: "otp must be number"
    })
  })
});
var otpValidations = { resendOtp, verifyOtp };

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies
    });
    return next();
  } catch (error) {
    next(error);
  }
};
var validateRequest_default = validateRequest;

// src/middlewares/verifyToken.ts
var verifyToken = (allowedRoles) => async (req, res, next) => {
  try {
    const raw_token = req.headers.authorization;
    if (!raw_token) {
      throw new error_default(
        HttpStatusCode.UNAUTHORIZED,
        "Authenticated failed. Please provide access token in authorization headers to access the resource(s)"
      );
    }
    let token = raw_token;
    if (raw_token.startsWith("Bearer ")) {
      token = raw_token.split(" ")[1];
    }
    const isVerified = jwtHelper_default.verifyToken(token);
    if (!isVerified) {
      throw new error_default(
        HttpStatusCode.UNAUTHORIZED,
        "Invalid or incomplete token payload"
      );
    }
    const sessionKey = `session:${isVerified.id}`;
    const sessionExists = await pubClient.get(sessionKey);
    if (!sessionExists) {
      throw new error_default(
        HttpStatusCode.UNAUTHORIZED,
        "Session has expired or is invalid. Please login again."
      );
    }
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      let isAllowed = allowedRoles.includes(isVerified.role);
      if (!isAllowed && isVerified.role === ROLES.MODERATOR) {
        const isRequestingUserManagement = req.baseUrl.startsWith("/admin/users") || req.originalUrl.startsWith("/api/v1/admin/users");
        const requiresAdminRole = allowedRoles.includes(ROLES.ADMIN) || allowedRoles.includes(ROLES.SUPER_ADMIN);
        if (requiresAdminRole && !isRequestingUserManagement) {
          isAllowed = true;
        }
      }
      if (!isAllowed) {
        throw new error_default(
          HttpStatusCode.FORBIDDEN,
          "Forbidden: Access denied"
        );
      }
    }
    req.user = isVerified;
    next();
  } catch (error) {
    next(error);
  }
};
var verifyToken_default = verifyToken;

// src/modules/admin/admin.route.ts
var router = (0, import_express.Router)();
router.post(
  "/",
  validateRequest_default(adminValidations.create),
  AdminController.createAdmin
);
router.post(
  "/login",
  validateRequest_default(adminValidations.login),
  AdminController.adminLogin
);
router.post(
  "/verify",
  validateRequest_default(otpValidations.verifyOtp),
  AdminController.verifyAccount
);
router.post(
  "/resend-otp",
  validateRequest_default(otpValidations.resendOtp),
  AdminController.resendVerificationOtp
);
router.post(
  "/approve",
  validateRequest_default(adminValidations.approveAccount),
  AdminController.approveAdminAccount
);
router.get(
  "/auth",
  verifyToken_default([ROLES.ADMIN]),
  AdminController.getLoggedInAdmin
);
router.get("/", verifyToken_default([ROLES.ADMIN]), AdminController.getAllAdmins);
router.get("/:id", verifyToken_default([ROLES.ADMIN]), AdminController.getAdminById);
router.get(
  "/email/:email",
  verifyToken_default([ROLES.ADMIN]),
  AdminController.getAdminByEmail
);
router.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN]),
  validateRequest_default(adminValidations.update),
  AdminController.updateAdmin
);
router.patch(
  "/:id/password",
  verifyToken_default([ROLES.ADMIN]),
  validateRequest_default(adminValidations.changePassword),
  AdminController.changePassword
);
router.patch(
  "/reset-password",
  validateRequest_default(adminValidations.login),
  AdminController.resetPassword
);
router.delete("/:id", AdminController.deleteAdmin);
var AdminRoutes = router;

// src/modules/admin/auth-admin.route.ts
var import_express2 = require("express");

// src/utils/allowedImageTypes.ts
var allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/x-icon",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/apng",
  "image/x-ms-bmp",
  "image/x-citrix-jpeg",
  "image/x-citrix-png"
];
var allowedExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
  ".svg",
  ".ico",
  ".heic",
  ".heif",
  ".avif",
  ".apng"
];

// src/config/multer.ts
var import_multer2 = __toESM(require("multer"));
var import_path3 = __toESM(require("path"));
var MAX_SIZE = 100 * 1024 * 1024;
var upload = (0, import_multer2.default)({
  storage: import_multer2.default.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE
  },
  fileFilter: (req, file, cb) => {
    const ext = import_path3.default.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedImageTypes.includes(mime) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new error_default(
          HttpStatusCode.BAD_REQUEST,
          `Only image files are allowed. You provided:'${ext}'. Allowed types: ${allowedImageTypes.join(", ")}`
        )
      );
    }
  }
});

// src/modules/admin/auth-admin.route.ts
var router2 = (0, import_express2.Router)();
router2.get(
  "/me",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  AdminController.getLoggedInAdmin
);
router2.post(
  "/me",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  upload.single("profile_picture"),
  AdminController.updateLoggedInAdmin
);
router2.post(
  "/change-password",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  AdminController.changeLoggedInAdminPassword
);
var AuthAdminRoutes = router2;

// src/modules/otp/otp.route.ts
var import_express3 = require("express");

// src/modules/otp/otp.controller.ts
var Controller2 = class extends baseController_default {
  verifyOTP = this.catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    await OTPService.verifyOTP(email, otp);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your OTP verification has been successful",
      data: null
    });
  });
};
var OTPController = new Controller2();

// src/modules/otp/otp.route.ts
var router3 = (0, import_express3.Router)();
router3.post(
  "/verify",
  validateRequest_default(otpValidations.verifyOtp),
  OTPController.verifyOTP
);
var OTPRoutes = router3;

// src/modules/customer/customer.routes.ts
var import_express4 = require("express");

// src/modules/customer/customer.interface.ts
var AUTH_PROVIDERS2 = /* @__PURE__ */ ((AUTH_PROVIDERS3) => {
  AUTH_PROVIDERS3["GOOGLE"] = "google";
  AUTH_PROVIDERS3["FACEBOOK"] = "facebook";
  AUTH_PROVIDERS3["GITHUB"] = "github";
  AUTH_PROVIDERS3["EMAIL"] = "email";
  AUTH_PROVIDERS3["APPLE"] = "apple";
  AUTH_PROVIDERS3["TWITTER"] = "twitter";
  AUTH_PROVIDERS3["LINKEDIN"] = "linkedin";
  AUTH_PROVIDERS3["INSTAGRAM"] = "instagram";
  return AUTH_PROVIDERS3;
})(AUTH_PROVIDERS2 || {});

// src/modules/customer/customer.model.ts
var import_mongoose5 = require("mongoose");

// src/common/models/delivery-address.model.ts
var import_mongoose4 = require("mongoose");
var deliveryAddressSchema = new import_mongoose4.Schema(
  {
    label: { type: String },
    street: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    country: { type: String },
    instructions: { type: String },
    is_default: { type: Boolean, default: false },
    full_address: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  schemaOptions
);
deliveryAddressSchema.pre("save", function(next) {
  const parts = [
    this.street,
    this.area,
    this.city,
    this.state,
    this.zip_code,
    this.country
  ].filter(Boolean).map((p) => p.trim());
  this.full_address = parts.join(", ");
  next();
});
deliveryAddressSchema.virtual("computed_full_address").get(function() {
  const parts = [
    this.street,
    this.area,
    this.city,
    this.state,
    this.zip_code,
    this.country
  ];
  return parts.filter(Boolean).join(", ");
});

// src/modules/customer/customer.model.ts
var customerSchema = new import_mongoose5.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone_no: { type: String, default: null },
    date_of_birth: { type: String, default: null },
    role: { type: String, default: ROLES.CUSTOMER },
    delivery_addresses: { type: [deliveryAddressSchema], default: [], max: 3 },
    password: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    last_login_at: { type: Date, default: null },
    auth_provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS2),
      default: "email" /* EMAIL */
    },
    has_password: { type: Boolean, default: true }
  },
  schemaOptions
);
var CustomerModel = (0, import_mongoose5.model)("Customer", customerSchema);

// src/modules/customer/customer.service.ts
var import_axios = __toESM(require("axios"));
var Service7 = class {
  // customer services
  async register(data) {
    const isExist = await CustomerModel.findOne({ email: data.email });
    if (isExist) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "You have already an account with this email. Please login to access you account"
      );
    }
    await OTPService.sendAccountVerificationOtp(
      data.full_name,
      data.email,
      "customer"
    );
    data.password = await BcryptInstance.hash(data.password);
    await CustomerModel.create(data);
  }
  async resendVerificationOtp(email) {
    const isExist = await CustomerModel.findOne({ email });
    if (!isExist) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }
    if (isExist.status === "active") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    }
    await OTPService.sendAccountVerificationOtp(
      isExist.full_name,
      isExist.email,
      "customer"
    );
  }
  async verifyAccount(email, otp) {
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }
    if (customer.status === "active") {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    }
    await OTPService.verifyOTP(email, otp);
    await CustomerModel.updateOne(
      { email },
      { status: "active", last_login_at: /* @__PURE__ */ new Date() }
    );
    return await this.generateLoginCredentials(customer);
  }
  async login(payload) {
    if (payload.access_token) {
      return await this.googleLogin(payload.access_token);
    }
    const isExist = await CustomerModel.findOneAndUpdate(
      { email: payload.email },
      {
        last_login_at: /* @__PURE__ */ new Date()
      }
    ).select({ delivery_addresses: 0 }).lean();
    if (!isExist) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }
    if (isExist.status !== "active") {
      await OTPService.sendAccountVerificationOtp(
        isExist.full_name,
        isExist.email,
        "customer"
      );
      throw new error_default(
        HttpStatusCode.UNAUTHORIZED,
        "Your account is not verified yet. We've sent a verification code to your email"
      );
    }
    const createdWithSocialProvider = isExist.auth_provider !== "email" /* EMAIL */ && !isExist.has_password;
    if (createdWithSocialProvider) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "This account was created using a social login provider. Please sign in using your social account or set a password to enable email/password login."
      );
    }
    if (!isExist.password) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Password is not set for this user. Please sign in using your social account or set a password to enable email/password login."
      );
    }
    const isPasswordMatched = await BcryptInstance.compare(
      payload.password,
      isExist.password
    );
    if (!isPasswordMatched) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "Invalid credentials. Please provide valid email and password"
      );
    }
    return this.generateLoginCredentials(isExist);
  }
  async googleLogin(access_token) {
    try {
      const response = await import_axios.default.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      const googleUser = response.data;
      if (!googleUser || !googleUser.email) {
        throw new error_default(
          HttpStatusCode.BAD_REQUEST,
          "Invalid Google token or email not found"
        );
      }
      const isExist = await CustomerModel.findOne({ email: googleUser.email }).select({ delivery_addresses: 0, password: 0 }).lean();
      if (isExist) {
        return await this.generateLoginCredentials(isExist);
      } else {
        const userData = {
          full_name: googleUser.name,
          email: googleUser.email,
          status: "active",
          last_login_at: /* @__PURE__ */ new Date(),
          auth_provider: "google" /* GOOGLE */,
          has_password: false
        };
        const newUser = await CustomerModel.create(userData);
        return await this.generateLoginCredentials(newUser);
      }
    } catch (error) {
      console.log(error);
      throw new error_default(
        HttpStatusCode.UNAUTHORIZED,
        "Google login failed: Invalid or expired token"
      );
    }
  }
  async generateLoginCredentials(customer) {
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }
    const jwtPayload = {
      id: customer._id.toString(),
      email: customer.email,
      role: customer.role
    };
    const { access_token, refresh_token } = await jwtHelper_default.generateTokens(jwtPayload);
    await pubClient.set(`session:${customer._id.toString()}`, "active", { ex: 604800 });
    delete customer.password;
    return {
      user: customer,
      access_token,
      refresh_token
    };
  }
  async getLoggedInCustomer(id) {
    return await CustomerModel.findById(id).select({ password: 0 });
  }
  async getCustomerDeliveryAddress(id) {
    const data = await CustomerModel.findById(id).select({ password: 0 });
    return data?.delivery_addresses;
  }
  async update(id, data) {
    await CustomerModel.findByIdAndUpdate(id, data);
  }
  async changePassword(id, data) {
    const isExist = await CustomerModel.findById(id);
    if (!isExist) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }
    if (!data.new_password) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "New password is required"
      );
    }
    const newPassword = await BcryptInstance.hash(data.new_password);
    await CustomerModel.findByIdAndUpdate(id, { password: newPassword });
    await pubClient.del(`session:${id}`);
  }
  async resetPassword(data) {
    const isExist = await CustomerModel.findOne({ email: data.email });
    if (!isExist) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }
    const newPassword = await BcryptInstance.hash(data.password);
    await CustomerModel.findByIdAndUpdate(isExist._id, {
      password: newPassword
    });
    await pubClient.del(`session:${isExist._id.toString()}`);
  }
  async addDeliveryAddress(id, newAddress) {
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }
    const addresses = customer.delivery_addresses || [];
    if (addresses.length >= 3) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "You can only add up to 3 delivery addresses."
      );
    }
    const isDuplicate = this.checkDuplicate(addresses, newAddress);
    if (isDuplicate) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "This delivery address already exists."
      );
    }
    const hasDefault = addresses.some((addr) => addr.is_default);
    if (!hasDefault && !newAddress.is_default) {
      newAddress.is_default = true;
    }
    if (newAddress.is_default) {
      await CustomerModel.updateOne(
        { _id: id },
        { $set: { "delivery_addresses.$[].is_default": false } }
      );
    }
    await CustomerModel.findByIdAndUpdate(id, {
      $push: { delivery_addresses: newAddress }
    });
  }
  checkDuplicate(addresses, newAddress) {
    const normalize = (str) => str.trim().toLowerCase();
    const isDuplicate = addresses.some(
      (addr) => normalize(addr.street) === normalize(newAddress.street) && normalize(addr.city) === normalize(newAddress.city) && normalize(addr.state) === normalize(newAddress.state) && normalize(addr.zip_code) === normalize(newAddress.zip_code)
    );
    return isDuplicate;
  }
  async updateDeliveryAddress(customer_id, address_id, updatedAddress) {
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }
    const addresses = customer.delivery_addresses || [];
    const address = addresses.find(
      (addr) => addr._id?.toString() === address_id
    );
    if (!address) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Delivery address not found for this customer."
      );
    }
    const isDuplicate = this.checkDuplicate(
      addresses.filter((a) => a._id?.toString() !== address_id),
      updatedAddress
    );
    if (isDuplicate) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "This delivery address already exists."
      );
    }
    const isCurrentDefault = address.is_default === true;
    if (updatedAddress.is_default === true) {
      addresses.forEach((addr) => addr.is_default = false);
      address.is_default = true;
    } else if (isCurrentDefault && updatedAddress.is_default === false && !addresses.some(
      (addr) => addr._id?.toString() !== address_id && addr.is_default
    )) {
      address.is_default = true;
    }
    if (!addresses.some((addr) => addr.is_default)) {
      address.is_default = true;
    }
    const { is_default, ...rest } = updatedAddress;
    console.log({ is_default });
    Object.assign(address, rest);
    await customer.save();
  }
  async removeDeliveryAddress(customer_id, address_id) {
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }
    const addresses = customer.delivery_addresses || [];
    const indexToRemove = addresses.findIndex(
      (addr) => addr._id?.toString() === address_id
    );
    if (indexToRemove === -1) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Delivery address not found for this customer."
      );
    }
    if (addresses.length === 1) {
      throw new error_default(
        HttpStatusCode.BAD_REQUEST,
        "You must have at least one delivery address."
      );
    }
    const wasDefault = addresses[indexToRemove].is_default === true;
    addresses.splice(indexToRemove, 1);
    if (wasDefault) {
      addresses.forEach((addr) => addr.is_default = false);
      addresses[0].is_default = true;
    }
    if (!addresses.some((addr) => addr.is_default)) {
      addresses[0].is_default = true;
    }
    customer.delivery_addresses = addresses;
    await customer.save();
  }
  async getOrders(customer_id) {
    return [];
  }
  async getOrderCount(customer_id) {
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }
    return {
      total_orders: 0,
      takeaway: 0,
      reservation: 0,
      delivery: 0,
      catering: 0
    };
  }
  // admin services
  async getAllCustomers(options, status2, search_query) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const query = {};
    if (search_query) {
      query.$or = [
        { full_name: { $regex: search_query, $options: "i" } },
        { email: { $regex: search_query, $options: "i" } },
        { phone_no: { $regex: search_query, $options: "i" } }
      ];
    }
    if (status2) {
      query.status = status2;
    }
    const customersWithOrders = await CustomerModel.aggregate([
      {
        $match: query
      },
      {
        $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $addFields: {
          orders: {
            total_reservation: 0,
            total_takeaway: 0,
            total_catering: 0,
            total_delivery: 0
          }
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]);
    const total = await CustomerModel.countDocuments(query);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: customersWithOrders
    };
  }
};
var CustomerService = new Service7();

// src/modules/customer/customer.controller.ts
init_eventEmitter();
var Controller3 = class extends baseController_default {
  register = this.catchAsync(async (req, res) => {
    await CustomerService.register(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Your account has been created successfully",
      data: null
    });
  });
  resendVerificationOtp = this.catchAsync(
    async (req, res) => {
      await CustomerService.resendVerificationOtp(req.body.email);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "We've sent a verification otp to your email. Please check the mailbox and verify the account",
        data: null
      });
    }
  );
  verifyAccount = this.catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const data = await CustomerService.verifyAccount(email, otp);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your account has been verified and authenticated successfully.",
      data
    });
  });
  login = this.catchAsync(async (req, res) => {
    const data = await CustomerService.login(req.body);
    emitter.emit("user.logged_in", {
      userId: data.user.id || data.user._id,
      guestId: req.cookies.guest_id
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "You have logged in successfully",
      data
    });
  });
  getLoggedInCustomer = this.catchAsync(async (req, res) => {
    const data = await CustomerService.getLoggedInCustomer(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer retrieved successfully",
      data
    });
  });
  getOrders = this.catchAsync(async (req, res) => {
    const data = await CustomerService.getOrders(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer orders retrieved successfully",
      data
    });
  });
  getOrderCount = this.catchAsync(async (req, res) => {
    const data = await CustomerService.getOrderCount(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer orders count retrieved successfully",
      data
    });
  });
  getCustomerDeliveryAddress = this.catchAsync(
    async (req, res) => {
      const data = await CustomerService.getCustomerDeliveryAddress(
        req.user?.id
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Customer delivery addresses retrieved successfully",
        data
      });
    }
  );
  update = this.catchAsync(async (req, res) => {
    await CustomerService.update(req.user?.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your account is updated successfully",
      data: null
    });
  });
  changePassword = this.catchAsync(async (req, res) => {
    await CustomerService.changePassword(req.user?.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your password successfully",
      data: null
    });
  });
  resetPassword = this.catchAsync(async (req, res) => {
    await CustomerService.resetPassword(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your password has been reset successfully",
      data: null
    });
  });
  addDeliveryAddress = this.catchAsync(async (req, res) => {
    await CustomerService.addDeliveryAddress(req.params.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your delivery address added successfully",
      data: null
    });
  });
  updateDeliveryAddress = this.catchAsync(
    async (req, res) => {
      await CustomerService.updateDeliveryAddress(
        req.params.id,
        req.params.address_id,
        req.body
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your delivery address updated successfully",
        data: null
      });
    }
  );
  removeDeliveryAddress = this.catchAsync(
    async (req, res) => {
      await CustomerService.removeDeliveryAddress(
        req.params.id,
        req.params.address_id
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your delivery address removed successfully",
        data: null
      });
    }
  );
  getAllCustomers = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const result = await CustomerService.getAllCustomers(
      options,
      req.query.status,
      req.query.search_query
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customers retrieved successfully",
      data: result
    });
  });
};
var CustomerController = new Controller3();

// src/common/validation.ts
var import_zod4 = __toESM(require("zod"));
var orderItemValidationSchema = import_zod4.default.lazy(
  () => import_zod4.default.object({
    id: import_zod4.default.string().nonempty("Item ID is required"),
    name: import_zod4.default.string().nonempty("Item name is required"),
    quantity: import_zod4.default.number().int().optional(),
    price: import_zod4.default.number().optional(),
    variants: import_zod4.default.array(orderItemValidationSchema).optional().default([])
  })
);
var orderAddonValidationSchema = import_zod4.default.object({
  id: import_zod4.default.string().nonempty("Addon ID is required"),
  name: import_zod4.default.string().nonempty("Addon name is required"),
  quantity: import_zod4.default.number().int().nonnegative(),
  price: import_zod4.default.number().nonnegative()
});
var customerDeliveryAddressValidationSchema = import_zod4.default.object({
  body: import_zod4.default.object({
    label: import_zod4.default.string().optional(),
    street: import_zod4.default.string().optional(),
    area: import_zod4.default.string().optional(),
    city: import_zod4.default.string().optional(),
    state: import_zod4.default.string().optional(),
    zip_code: import_zod4.default.string().optional(),
    country: import_zod4.default.string().optional(),
    instructions: import_zod4.default.string().optional(),
    is_default: import_zod4.default.boolean().default(false),
    location: import_zod4.default.object({
      lat: import_zod4.default.number().optional(),
      lng: import_zod4.default.number().optional()
    }).optional()
  }).strict()
});
var updateCustomerDeliveryAddressValidationSchema = import_zod4.default.object({
  body: import_zod4.default.object({
    street: import_zod4.default.string().optional(),
    area: import_zod4.default.string().optional(),
    city: import_zod4.default.string().optional(),
    state: import_zod4.default.string().optional(),
    zip_code: import_zod4.default.string().optional(),
    country: import_zod4.default.string().optional(),
    instructions: import_zod4.default.string().optional(),
    is_default: import_zod4.default.boolean().default(false),
    location: import_zod4.default.object({
      lat: import_zod4.default.number().optional(),
      lng: import_zod4.default.number().optional()
    }).optional()
  }).strict()
});

// src/modules/customer/customer.validate.ts
var import_zod5 = __toESM(require("zod"));
var register = import_zod5.default.object({
  body: import_zod5.default.object({
    full_name: import_zod5.default.string({ required_error: "Full name is required" }).min(1, "Full name cannot be empty"),
    email: import_zod5.default.string({ required_error: "Email is required" }).email("Invalid email format"),
    phone_no: import_zod5.default.string().optional(),
    date_of_birth: import_zod5.default.string().optional(),
    password: import_zod5.default.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    delivery_addresses: import_zod5.default.array(customerDeliveryAddressValidationSchema).optional()
  }).strict()
});
var update2 = import_zod5.default.object({
  body: import_zod5.default.object({
    full_name: import_zod5.default.string().optional(),
    phone_no: import_zod5.default.string().optional(),
    date_of_birth: import_zod5.default.string().optional()
  }).strict().refine(
    (data) => data.full_name !== void 0 || data.phone_no !== void 0 || data.date_of_birth !== void 0,
    {
      message: "At least one field is required",
      path: []
    }
  )
});
var changePassword2 = import_zod5.default.object({
  body: import_zod5.default.object({
    old_password: import_zod5.default.string({ required_error: "old_password is required" }),
    new_password: import_zod5.default.string({ required_error: "new_password is required" })
  }).strict()
});
var login2 = import_zod5.default.object({
  body: import_zod5.default.object({
    email: import_zod5.default.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: import_zod5.default.string({ required_error: "Password is required" })
  })
});
var customerValidations = { register, login: login2, update: update2, changePassword: changePassword2 };

// src/modules/customer/customer.routes.ts
var router4 = (0, import_express4.Router)();
router4.post(
  "/",
  validateRequest_default(customerValidations.register),
  CustomerController.register
);
router4.post(
  "/verify",
  validateRequest_default(otpValidations.verifyOtp),
  CustomerController.verifyAccount
);
router4.post(
  "/resend-otp",
  validateRequest_default(otpValidations.resendOtp),
  CustomerController.resendVerificationOtp
);
router4.post("/login", CustomerController.login);
router4.get(
  "/auth",
  verifyToken_default([ROLES.CUSTOMER]),
  CustomerController.getLoggedInCustomer
);
router4.get(
  "/orders",
  // verifyToken([ROLES.CUSTOMER]),
  CustomerController.getOrders
);
router4.get(
  "/orders/count",
  verifyToken_default([ROLES.CUSTOMER]),
  CustomerController.getOrderCount
);
router4.get(
  "/delivery-address",
  verifyToken_default([ROLES.CUSTOMER]),
  CustomerController.getCustomerDeliveryAddress
);
router4.patch(
  "/",
  verifyToken_default([ROLES.CUSTOMER]),
  validateRequest_default(customerValidations.update),
  CustomerController.update
);
router4.patch(
  "/change-password",
  verifyToken_default([ROLES.CUSTOMER]),
  CustomerController.changePassword
);
router4.patch(
  "/reset-password",
  validateRequest_default(customerValidations.login),
  CustomerController.resetPassword
);
router4.post(
  "/:id/add-delivery-address",
  verifyToken_default([ROLES.CUSTOMER]),
  validateRequest_default(customerDeliveryAddressValidationSchema),
  CustomerController.addDeliveryAddress
);
router4.patch(
  "/:id/update-delivery-address/:address_id",
  verifyToken_default([ROLES.CUSTOMER]),
  validateRequest_default(updateCustomerDeliveryAddressValidationSchema),
  CustomerController.updateDeliveryAddress
);
router4.delete(
  "/:id/delete-delivery-address/:address_id",
  verifyToken_default([ROLES.CUSTOMER]),
  CustomerController.removeDeliveryAddress
);
router4.get("/", verifyToken_default([ROLES.ADMIN]), CustomerController.getAllCustomers);
var CustomerRoutes = router4;

// src/modules/forget-password/forgetPassword.routes.ts
var import_express5 = require("express");

// src/modules/forget-password/forgetPassword.service.ts
var Service8 = class {
  async adminForgetPassword(email) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account was not found!"
      );
    }
    await OTPService.sendForgetPasswordOtp(admin.name, admin.email);
  }
  async customerForgetPassword(email) {
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Your account was not found!"
      );
    }
    await OTPService.sendForgetPasswordOtp(customer.full_name, customer.email);
  }
};
var ForgetPasswordService = new Service8();

// src/modules/forget-password/forgetPassword.controller.ts
var Controller4 = class extends baseController_default {
  adminForgetPassword = this.catchAsync(async (req, res) => {
    await ForgetPasswordService.adminForgetPassword(req.body.email);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "We've sent a verification code to your email",
      data: null
    });
  });
  customerForgetPassword = this.catchAsync(
    async (req, res) => {
      await ForgetPasswordService.customerForgetPassword(req.body.email);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "We've sent a verification code to your email",
        data: null
      });
    }
  );
};
var ForgetPasswordController = new Controller4();

// src/modules/forget-password/forgetPassword.validate.ts
var import_zod6 = __toESM(require("zod"));
var forgetPasswordValidation = import_zod6.default.object({
  body: import_zod6.default.object({
    email: import_zod6.default.string({ required_error: "Email is required" }).email({ message: "Invalid email. Please provide a valid email" })
  })
});

// src/modules/forget-password/forgetPassword.routes.ts
var router5 = (0, import_express5.Router)();
router5.post(
  "/admin",
  validateRequest_default(forgetPasswordValidation),
  ForgetPasswordController.adminForgetPassword
);
router5.post(
  "/customer",
  validateRequest_default(forgetPasswordValidation),
  ForgetPasswordController.customerForgetPassword
);
var ForgetPasswordRoutes = router5;

// src/modules/statistics/statistics.routes.ts
var import_express6 = require("express");

// src/constants/days.ts
var WEEK_DAYS = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday"
};

// src/modules/product/product.model.ts
var import_mongoose6 = require("mongoose");
function generateBatchId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BAT-${code}`;
}
var batchSchema = new import_mongoose6.Schema({
  id: { type: String },
  batch_id: { type: String, default: generateBatchId },
  packs_added: { type: Number, required: true },
  hold_qty: { type: Number, default: 0 },
  pack_price: { type: Number, required: true },
  packs_total_price: { type: Number },
  purchase_rate_carton: { type: Number, required: true },
  selling_rate_carton: { type: Number, required: true },
  dateAdded: { type: Date, default: Date.now }
});
var productSchema = new import_mongoose6.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    product_summary: { type: String },
    carton_packets: { type: Number, required: true },
    box_size: { type: Number },
    company_name: { type: String, required: true },
    category_name: { type: String, required: true },
    lowStockThreshold: { type: Number, required: true },
    batches: { type: [batchSchema], default: [] }
  },
  {
    ...schemaOptions,
    optimisticConcurrency: true
  }
);
var ProductModel = (0, import_mongoose6.model)("Product", productSchema);

// src/modules/damage-record/damage-record.model.ts
var import_mongoose7 = require("mongoose");
function generateDamageNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DMG-${code}`;
}
var damageRecordItemSchema = new import_mongoose7.Schema({
  product_id: { type: import_mongoose7.Schema.Types.ObjectId, ref: "Product", required: true },
  product_name: { type: String, required: true },
  batch_id: { type: String, required: true },
  qty: { type: Number, required: true },
  purchase_price: { type: Number, required: true },
  loss_amount: { type: Number, required: true }
});
var damageRecordSchema = new import_mongoose7.Schema(
  {
    damage_number: {
      type: String,
      unique: true,
      default: generateDamageNumber
    },
    source_type: {
      type: String,
      enum: [
        "Delivery Settlement",
        "Warehouse",
        "Expired",
        "Supplier Return",
        "Customer Return"
      ],
      required: true
    },
    source_reference_id: { type: import_mongoose7.Schema.Types.ObjectId },
    created_by: { type: String, required: true },
    approved_by: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Disposed"],
      default: "Pending"
    },
    damage_date: { type: String, required: true },
    damage_reason: { type: String },
    qty: { type: Number, required: true },
    loss_amount: { type: Number, required: true },
    items: { type: [damageRecordItemSchema], required: true }
  },
  schemaOptions
);
var DamageRecordModel = (0, import_mongoose7.model)(
  "DamageRecord",
  damageRecordSchema
);

// src/modules/settlement/settlement.model.ts
var import_mongoose8 = require("mongoose");
var settlementItemSchema = new import_mongoose8.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  loadedQuantity: { type: Number, required: true },
  soldQuantity: { type: Number, required: true },
  returnedQuantity: { type: Number, required: true },
  damagedQuantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true }
});
function generateSettlementInvoiceNo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SET-${code}`;
}
var settlementSchema = new import_mongoose8.Schema(
  {
    invoiceNo: {
      type: String,
      unique: true,
      default: generateSettlementInvoiceNo
    },
    loadingSheetInvoiceNo: { type: String },
    date: { type: String, required: true },
    deliveryManName: { type: String, required: true },
    deliveryManId: { type: String, required: true },
    route: { type: String },
    loadingSheetId: { type: String, required: true },
    totalLoaded: { type: Number, required: true },
    totalSold: { type: Number, required: true },
    totalReturned: { type: Number, required: true },
    totalDamaged: { type: Number, required: true },
    totalSales: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    totalLoss: { type: Number, required: true },
    status: { type: String, enum: ["finalized"], default: "finalized" },
    items: { type: [settlementItemSchema], required: true }
  },
  schemaOptions
);
var SettlementModel = (0, import_mongoose8.model)("Settlement", settlementSchema);

// src/modules/loading-sheet/loading-sheet.model.ts
var import_mongoose9 = require("mongoose");
function generateInvoiceNo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${code}`;
}
var loadingSheetSchema = new import_mongoose9.Schema(
  {
    invoice_no: { type: String, unique: true, default: generateInvoiceNo },
    delivery_man_id: { type: String, required: true },
    delivery_man_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["loading", "loaded", "in_transit", "settled"],
      default: "loading"
    },
    loading_date: { type: Date, default: Date.now },
    settlement_date: { type: Date },
    route: { type: String }
  },
  schemaOptions
);
var loadingSheetDetailSchema = new import_mongoose9.Schema(
  {
    loading_sheet_id: {
      type: import_mongoose9.Schema.Types.ObjectId,
      ref: "LoadingSheet",
      required: true
    },
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    batch_id: { type: import_mongoose9.Schema.Types.ObjectId, required: true },
    loaded_qty: { type: Number, required: true },
    sold_qty: { type: Number, default: 0 },
    returned_qty: { type: Number, default: 0 },
    damaged_qty: { type: Number, default: 0 },
    free_qty: { type: Number, default: 0 },
    purchase_price: { type: Number, required: true },
    selling_price: { type: Number, required: true }
  },
  schemaOptions
);
var LoadingSheetModel = (0, import_mongoose9.model)(
  "LoadingSheet",
  loadingSheetSchema
);
var LoadingSheetDetailModel = (0, import_mongoose9.model)(
  "LoadingSheetDetail",
  loadingSheetDetailSchema
);

// src/modules/statistics/statistics.service.ts
var Service9 = class {
  async getDashboardSummary(dates) {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const products = await ProductModel.find({});
    let totalAvailableStock = 0;
    let totalPurchaseStockValue = 0;
    let totalSaleStockValue = 0;
    const lowStockItems = [];
    for (const product of products) {
      const productObj = product.toObject ? product.toObject() : product;
      const batches = productObj.batches || [];
      const carton_packets = productObj.carton_packets || 1;
      const productAvailableStock = batches.reduce(
        (sum, b) => sum + (Math.round(Number(b.packs_added)) || 0),
        0
      );
      totalAvailableStock += productAvailableStock;
      const purchaseVal = batches.reduce(
        (sum, b) => sum + (Number(b.packs_added) || 0) * ((Number(b.purchase_rate_carton) || 0) / carton_packets),
        0
      );
      totalPurchaseStockValue += purchaseVal;
      const saleVal = batches.reduce(
        (sum, b) => sum + (Number(b.packs_added) || 0) * (Number(b.pack_price) || 0),
        0
      );
      totalSaleStockValue += saleVal;
      if (productAvailableStock <= (productObj.lowStockThreshold || 0)) {
        let avgPurchasePrice = 0;
        if (batches.length > 0) {
          const sumRates = batches.reduce(
            (sum, b) => sum + (Number(b.purchase_rate_carton) || 0),
            0
          );
          avgPurchasePrice = sumRates / batches.length / carton_packets;
        }
        lowStockItems.push({
          sl: lowStockItems.length + 1,
          product: productObj.name,
          purchase: avgPurchasePrice.toFixed(2),
          quantity: productAvailableStock,
          subTotal: (productAvailableStock * avgPurchasePrice).toFixed(2)
        });
      }
    }
    const damageFilter = {};
    if (dates?.start_date || dates?.end_date) {
      damageFilter.damage_date = {};
      if (dates.start_date) damageFilter.damage_date.$gte = dates.start_date;
      if (dates.end_date) damageFilter.damage_date.$lte = dates.end_date;
    }
    const approvedDamage = await DamageRecordModel.find({
      status: "Approved",
      ...damageFilter
    });
    const totalAvailableDamageStock = approvedDamage.reduce(
      (sum, d) => sum + (d.qty || 0),
      0
    );
    const totalDamageStockValue = approvedDamage.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );
    let returnDamageQuery = {};
    if (dates?.start_date || dates?.end_date) {
      returnDamageQuery = { ...damageFilter };
    } else {
      returnDamageQuery = { damage_date: todayStr };
    }
    const todayDamages = await DamageRecordModel.find(returnDamageQuery);
    const todayReturnDamage = todayDamages.reduce(
      (sum, d) => sum + (d.qty || 0),
      0
    );
    const todayReturnAmount = todayDamages.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );
    const allDamages = await DamageRecordModel.find(damageFilter);
    const saleReturnDamage = allDamages.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );
    const settlementFilter = {};
    if (dates?.start_date || dates?.end_date) {
      settlementFilter.date = {};
      if (dates.start_date) settlementFilter.date.$gte = dates.start_date;
      if (dates.end_date) settlementFilter.date.$lte = dates.end_date;
    }
    const settlements = await SettlementModel.find(settlementFilter);
    let totalSales = 0;
    let todaySaleAmount = 0;
    for (const settlement of settlements) {
      totalSales += settlement.totalSales || 0;
      if (dates?.start_date || dates?.end_date) {
        todaySaleAmount += settlement.totalSales || 0;
      } else if (settlement.date === todayStr) {
        todaySaleAmount += settlement.totalSales || 0;
      }
    }
    const activeLoadingSheets = await LoadingSheetModel.find({
      status: { $in: ["loaded", "in_transit"] }
    });
    let totalStaffDue = 0;
    for (const sheet of activeLoadingSheets) {
      const details = await LoadingSheetDetailModel.find({
        loading_sheet_id: sheet._id
      });
      const sheetExpectedValue = details.reduce(
        (sum, d) => sum + (d.loaded_qty || 0) * (d.selling_price || 0),
        0
      );
      totalStaffDue += sheetExpectedValue;
    }
    const totalCustomerDue = Number((totalSales * 0.05).toFixed(2));
    const totalDue = Number((totalCustomerDue + totalStaffDue).toFixed(2));
    const totalSupplierDue = Number((totalPurchaseStockValue * 0.1).toFixed(2));
    const todayCollection = todaySaleAmount;
    const todayCustomerCollection = Number((todaySaleAmount * 0.8).toFixed(2));
    const todayStaffCollection = Number((todaySaleAmount * 0.2).toFixed(2));
    const totalCashBalance = Number((totalSales * 0.6).toFixed(2));
    const totalBankBalance = Number((totalSales * 0.3).toFixed(2));
    const totalMobileBankBalance = Number((totalSales * 0.1).toFixed(2));
    const totalBalance = Number(
      (totalCashBalance + totalBankBalance + totalMobileBankBalance).toFixed(2)
    );
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = d.toISOString().slice(0, 10);
      const daySettlements = settlements.filter((s) => s.date === dateStr);
      const saleUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalSold || 0),
        0
      );
      const returnedUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalReturned || 0),
        0
      );
      const damagedUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalDamaged || 0),
        0
      );
      weeklyTrend.push({
        name: dayName,
        "Sale Units": saleUnits,
        "Returned Units": returnedUnits,
        "Damaged Units": damagedUnits
      });
    }
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const monthlySaleVsExpense = [];
    const purchaseHistory = [];
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    for (let m = 0; m < 12; m++) {
      const monthName = months[m];
      const monthSettlements = settlements.filter((s) => {
        const sDate = new Date(s.date);
        return sDate.getFullYear() === currentYear && sDate.getMonth() === m;
      });
      const monthSales = monthSettlements.reduce(
        (sum, s) => sum + (s.totalSales || 0),
        0
      );
      const monthExpenses = monthSales > 0 ? Number((monthSales * 0.12).toFixed(2)) : 0;
      monthlySaleVsExpense.push({
        name: monthName,
        Sale: Number(monthSales.toFixed(2)),
        Expent: Number(monthExpenses.toFixed(2))
      });
    }
    for (let m = 0; m < 12; m++) {
      const monthName = months[m];
      let monthPurchases = 0;
      for (const p of products) {
        const productObj = p.toObject ? p.toObject() : p;
        for (const b of productObj.batches || []) {
          const bDate = b.dateAdded ? new Date(b.dateAdded) : /* @__PURE__ */ new Date();
          if (bDate.getFullYear() === currentYear && bDate.getMonth() === m) {
            const cartonPackets = productObj.carton_packets || 1;
            monthPurchases += (b.packs_added || 0) * ((b.purchase_rate_carton || 0) / cartonPackets);
          }
        }
      }
      purchaseHistory.push({
        name: monthName,
        Purchase: Number(monthPurchases.toFixed(2))
      });
    }
    const productSalesMap = {};
    for (const s of settlements) {
      for (const item of s.items) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            category: "General",
            qty: 0,
            rev: 0
          };
        }
        productSalesMap[item.productId].qty += item.soldQuantity || 0;
        productSalesMap[item.productId].rev += (item.soldQuantity || 0) * (item.sellingPrice || 0);
      }
    }
    for (const pId in productSalesMap) {
      const matchProd = products.find((p) => p._id.toString() === pId);
      if (matchProd) {
        productSalesMap[pId].category = matchProd.category_name || "General";
      }
    }
    const topProductsList = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 4).map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      category: p.category,
      sales: `${p.qty} Units`,
      revenue: `$${p.rev.toFixed(2)}`,
      growth: `+${Math.floor(Math.random() * 10) + 3}%`
    }));
    return {
      stockStats: {
        totalAvailableStock: totalAvailableStock.toFixed(0),
        totalPurchaseStockValue: totalPurchaseStockValue.toFixed(2),
        totalSaleStockValue: totalSaleStockValue.toFixed(2)
      },
      damageStats: {
        totalAvailableDamageStock: totalAvailableDamageStock.toFixed(0),
        totalDamageStockValue: totalDamageStockValue.toFixed(2),
        todayReturnDamage: todayReturnDamage.toFixed(0),
        todayReturnAmount: todayReturnAmount.toFixed(2),
        saleReturnDamage: saleReturnDamage.toFixed(2)
      },
      duesStats: {
        totalCustomerDue: totalCustomerDue.toFixed(2),
        totalStaffDue: totalStaffDue.toFixed(2),
        totalDue: totalDue.toFixed(2),
        totalSupplierDue: totalSupplierDue.toFixed(2)
      },
      collectionsStats: {
        todayStaffCollection: todayStaffCollection.toFixed(2),
        todayCustomerCollection: todayCustomerCollection.toFixed(2),
        todaySaleCollection: todayCollection.toFixed(2),
        todayCollection: todayCollection.toFixed(2)
      },
      dailyActivity: {
        todayExpense: (todaySaleAmount * 0.02).toFixed(2),
        // simulated
        todaySaleAmount: todaySaleAmount.toFixed(2),
        todaySaleDiscount: "0.00",
        todaySaleCampaignDiscount: "0.00",
        todayBadDebt: "0.00"
      },
      salesTotals: {
        saleDiscount: "0.00",
        saleCampaignDiscount: "0.00",
        totalSale: totalSales.toFixed(2)
      },
      balances: {
        totalCashBalance: totalCashBalance.toFixed(2),
        totalBankBalance: totalBankBalance.toFixed(2),
        totalMobileBankBalance: totalMobileBankBalance.toFixed(2),
        totalBalance: totalBalance.toFixed(2)
      },
      weeklyTrend,
      monthlySaleVsExpense,
      purchaseHistory,
      topProductsList,
      lowStockItems
    };
  }
  async getOrdersStatistics() {
    return [
      {
        category: "Catering",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0
        }
      },
      {
        category: "Food Delivery",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0
        }
      },
      {
        category: "Reservation",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0
        }
      },
      {
        category: "TakeAway",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0
        }
      }
    ];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllOrdersCardMetrics(dates) {
    return [
      {
        label: "Food Delivery",
        value: 0,
        data: [],
        total_sales: 0
      },
      {
        label: "Takeaway",
        value: 0,
        data: [],
        total_sales: 0
      },
      {
        label: "Reservation",
        value: 0,
        data: [],
        total_sales: 0
      },
      {
        label: "Catering",
        value: 0,
        data: [],
        total_sales: 0
      }
    ];
  }
  async getLast7DaysOrders() {
    const weekDays = Object.values(WEEK_DAYS);
    const todayIndex = (/* @__PURE__ */ new Date()).getDay();
    const last7DaysOrdered = [
      ...weekDays.slice(todayIndex + 1),
      ...weekDays.slice(0, todayIndex + 1)
    ];
    return last7DaysOrdered.map((day) => ({
      day,
      orders: 0,
      breakdown: {
        catering: 0,
        reservation: 0,
        takeaway: 0,
        delivery: 0
      }
    }));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStatusWiseOrdersMetrics(orderType) {
    return {
      placed: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      paid: 0,
      unpaid: 0
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRecentOrders(per_order_limit = 5, total_limit = 20) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRevenue(dates) {
    return {
      catering: 0,
      delivery: 0,
      reservation: 0,
      takeaway: 0
    };
  }
  async getCurrentStockReport(filters) {
    const productQuery = {};
    if (filters.company_name && filters.company_name !== "Select Company") {
      productQuery.company_name = filters.company_name;
    }
    if (filters.category_name && filters.category_name !== "Select category") {
      productQuery.category_name = filters.category_name;
    }
    if (filters.search_query) {
      productQuery.name = { $regex: filters.search_query, $options: "i" };
    }
    const products = await ProductModel.find(productQuery);
    const approvedDamages = await DamageRecordModel.find({
      status: "Approved"
    });
    const settlements = await SettlementModel.find({});
    return products.map((product, idx) => {
      const productObj = product.toObject ? product.toObject() : product;
      const pIdStr = productObj._id.toString();
      const carton_packets = productObj.carton_packets || 1;
      const stockQty = (productObj.batches || []).reduce(
        (sum, b) => sum + (Math.round(Number(b.packs_added)) || 0),
        0
      );
      let costPrice = 0;
      if (productObj.batches && productObj.batches.length > 0) {
        const sumRates = productObj.batches.reduce(
          (sum, b) => sum + (Number(b.purchase_rate_carton) || 0),
          0
        );
        costPrice = sumRates / productObj.batches.length / carton_packets;
      }
      let salePrice = 0;
      if (productObj.batches && productObj.batches.length > 0) {
        const sumSaleRates = productObj.batches.reduce(
          (sum, b) => sum + (Number(b.pack_price) || 0),
          0
        );
        salePrice = sumSaleRates / productObj.batches.length;
      }
      let outQty = 0;
      for (const s of settlements) {
        for (const item of s.items) {
          if (item.productId.toString() === pIdStr) {
            outQty += item.soldQuantity || 0;
          }
        }
      }
      let damageQty = 0;
      for (const d of approvedDamages) {
        for (const item of d.items || []) {
          if (item.product_id && item.product_id.toString() === pIdStr) {
            damageQty += item.qty || 0;
          }
        }
      }
      const inQty = stockQty + outQty + damageQty;
      const stockValue = stockQty * costPrice;
      const saleValue = stockQty * salePrice;
      return {
        sl: idx + 1,
        id: pIdStr,
        name: productObj.name,
        code: pIdStr.substring(pIdStr.length - 6).toUpperCase(),
        unit: productObj.unit || "Piece",
        boxSize: productObj.box_size || carton_packets,
        costPrice: Number(costPrice.toFixed(2)),
        inQty,
        outQty,
        stockQty,
        stockValue: Number(stockValue.toFixed(2)),
        saleValue: Number(saleValue.toFixed(2)),
        damageQty
      };
    });
  }
  async getProductSummaryReport(filters) {
    if (!filters.productId) {
      throw new Error("Product ID is required for Product Summary Report");
    }
    const product = await ProductModel.findById(filters.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    const productObj = product.toObject ? product.toObject() : product;
    const pIdStr = productObj._id.toString();
    const settlements = await SettlementModel.find({});
    const approvedDamages = await DamageRecordModel.find({
      "items.product_id": filters.productId,
      status: "Approved"
    });
    const events = [];
    for (const batch of productObj.batches || []) {
      const date = batch.dateAdded ? new Date(batch.dateAdded) : /* @__PURE__ */ new Date();
      events.push({
        date,
        details: `Restocked (Batch: ${batch.batch_id || "NEW"})`,
        in: Math.round(Number(batch.packs_added || 0)),
        out: 0
      });
    }
    for (const s of settlements) {
      const date = s.date ? new Date(s.date) : /* @__PURE__ */ new Date();
      for (const item of s.items) {
        if (item.productId.toString() === pIdStr) {
          if (item.soldQuantity > 0) {
            events.push({
              date,
              details: `Sold (Settlement: ${s.loadingSheetId || s._id})`,
              in: 0,
              out: item.soldQuantity
            });
          }
          if (item.returnedQuantity > 0) {
            events.push({
              date,
              details: `Returned (Settlement: ${s.loadingSheetId || s._id})`,
              in: item.returnedQuantity,
              out: 0
            });
          }
        }
      }
    }
    for (const d of approvedDamages) {
      const date = d.damage_date ? new Date(d.damage_date) : /* @__PURE__ */ new Date();
      for (const item of d.items || []) {
        if (item.product_id && item.product_id.toString() === pIdStr) {
          events.push({
            date,
            details: `Damage Write-off (Reason: ${d.damage_reason || d.source_type}, Ref: ${d._id.toString().substring(18)})`,
            in: 0,
            out: item.qty || 0
          });
        }
      }
    }
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    const start = filters.start_date ? new Date(filters.start_date) : null;
    const end = filters.end_date ? new Date(filters.end_date) : null;
    let openingStock = 0;
    const filteredEvents = [];
    for (const ev of events) {
      if (start && ev.date.getTime() < start.getTime()) {
        openingStock += ev.in - ev.out;
      } else if (end && ev.date.getTime() > end.getTime() + 864e5) {
      } else {
        filteredEvents.push(ev);
      }
    }
    let currentStock = openingStock;
    const transactions = filteredEvents.map((ev, idx) => {
      currentStock += ev.in - ev.out;
      return {
        sl: idx + 1,
        date: ev.date.toLocaleString("en-US", { hour12: true }),
        details: ev.details,
        in: ev.in > 0 ? ev.in.toString() : "",
        out: ev.out > 0 ? ev.out.toString() : "",
        currentStock
      };
    });
    return {
      productName: productObj.name,
      openingStock,
      transactions,
      currentStock
    };
  }
  async getDailySummaryReport(filters) {
    const settlementFilter = {};
    const damageFilter = {};
    if (filters.start_date || filters.end_date) {
      settlementFilter.date = {};
      damageFilter.damage_date = {};
      if (filters.start_date) {
        settlementFilter.date.$gte = filters.start_date;
        damageFilter.damage_date.$gte = filters.start_date;
      }
      if (filters.end_date) {
        settlementFilter.date.$lte = filters.end_date;
        damageFilter.damage_date.$lte = filters.end_date;
      }
    }
    const settlements = await SettlementModel.find(settlementFilter);
    const approvedDamages = await DamageRecordModel.find({
      status: "Approved",
      ...damageFilter
    });
    const uniqueDates = Array.from(
      /* @__PURE__ */ new Set([
        ...settlements.map((s) => s.date),
        ...approvedDamages.map((d) => d.damage_date)
      ])
    ).sort((a, b) => b.localeCompare(a));
    return uniqueDates.map((dateStr, idx) => {
      const daySettlements = settlements.filter((s) => s.date === dateStr);
      const dayDamages = approvedDamages.filter(
        (d) => d.damage_date === dateStr
      );
      const salesAmount = daySettlements.reduce(
        (sum, s) => sum + (s.totalSales || 0),
        0
      );
      const collectedAmount = salesAmount;
      const expense = Number((salesAmount * 0.02).toFixed(2));
      const damageAmount = dayDamages.reduce(
        (sum, d) => sum + (d.loss_amount || 0),
        0
      );
      const netCash = Number(
        (collectedAmount - expense - damageAmount).toFixed(2)
      );
      return {
        sl: idx + 1,
        date: dateStr,
        salesAmount: Number(salesAmount.toFixed(2)),
        collectedAmount: Number(collectedAmount.toFixed(2)),
        expense,
        damageAmount: Number(damageAmount.toFixed(2)),
        netCash
      };
    });
  }
  async getDailySaleReport(filters) {
    const query = {};
    if (filters.start_date || filters.end_date) {
      query.date = {};
      if (filters.start_date) query.date.$gte = filters.start_date;
      if (filters.end_date) query.date.$lte = filters.end_date;
    }
    if (filters.delivery_man_id && filters.delivery_man_id !== "Select Delivery Man") {
      query.deliveryManId = filters.delivery_man_id;
    }
    const settlements = await SettlementModel.find(query).sort({ date: -1 });
    return settlements.map((s, idx) => {
      const sObj = s.toObject ? s.toObject() : s;
      return {
        sl: idx + 1,
        id: sObj._id.toString(),
        date: sObj.date,
        settlementId: sObj._id.toString().substring(18).toUpperCase(),
        deliveryMan: sObj.deliveryManName,
        loadingSheetId: sObj.loadingSheetId || "N/A",
        totalSales: Number((sObj.totalSales || 0).toFixed(2)),
        totalReturned: Math.round(Number(sObj.totalReturned || 0)),
        totalDamaged: Math.round(Number(sObj.totalDamaged || 0)),
        profit: Number((sObj.totalProfit || 0).toFixed(2))
      };
    });
  }
  async getDailySaleProductReport(filters) {
    const query = {};
    if (filters.start_date || filters.end_date) {
      query.date = {};
      if (filters.start_date) query.date.$gte = filters.start_date;
      if (filters.end_date) query.date.$lte = filters.end_date;
    }
    const settlements = await SettlementModel.find(query);
    const productSales = {};
    for (const s of settlements) {
      for (const item of s.items) {
        const pIdStr = item.productId.toString();
        if (filters.product_id && filters.product_id !== "Select Product" && pIdStr !== filters.product_id) {
          continue;
        }
        if (!productSales[pIdStr]) {
          productSales[pIdStr] = {
            productName: item.productName,
            soldQty: 0,
            returnedQty: 0,
            revenue: 0,
            profit: 0
          };
        }
        const rev = (item.soldQuantity || 0) * (item.sellingPrice || 0);
        const cost = (item.soldQuantity || 0) * (item.purchasePrice || 0);
        const itemProfit = rev - cost;
        productSales[pIdStr].soldQty += item.soldQuantity || 0;
        productSales[pIdStr].returnedQty += item.returnedQuantity || 0;
        productSales[pIdStr].revenue += rev;
        productSales[pIdStr].profit += itemProfit;
      }
    }
    return Object.values(productSales).sort((a, b) => b.soldQty - a.soldQty).map((item, idx) => ({
      sl: idx + 1,
      productName: item.productName,
      soldQty: item.soldQty,
      returnedQty: item.returnedQty,
      revenue: Number(item.revenue.toFixed(2)),
      profit: Number(item.profit.toFixed(2))
    }));
  }
  async getDamageRecordsReport(filters) {
    const query = {};
    if (filters.start_date || filters.end_date) {
      query.damage_date = {};
      if (filters.start_date) query.damage_date.$gte = filters.start_date;
      if (filters.end_date) query.damage_date.$lte = filters.end_date;
    }
    if (filters.status && filters.status !== "All") {
      query.status = filters.status;
    }
    const records = await DamageRecordModel.find(query).sort({
      damage_date: -1
    });
    const rows = [];
    let sl = 1;
    for (const r of records) {
      const rObj = r.toObject ? r.toObject() : r;
      for (const item of rObj.items || []) {
        rows.push({
          sl: sl++,
          id: rObj._id.toString(),
          date: rObj.damage_date,
          productName: item.product_name || "Unknown Product",
          reason: rObj.damage_reason || rObj.source_type || "General Damage",
          qty: Math.round(Number(item.qty || 0)),
          lossAmount: Number((item.loss_amount || 0).toFixed(2)),
          status: rObj.status
        });
      }
    }
    return rows;
  }
};
var StatisticsService = new Service9();

// src/modules/statistics/statistics.controller.ts
var Controller5 = class extends baseController_default {
  getDashboardSummary = this.catchAsync(async (req, res) => {
    const { start_date, end_date } = req.query;
    const data = await StatisticsService.getDashboardSummary({
      start_date,
      end_date
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Dashboard summary statistics retrieved successfully",
      data
    });
  });
  getOrdersStatistics = this.catchAsync(async (req, res) => {
    const data = await StatisticsService.getOrdersStatistics();
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "All types of orders statistics retrieved successfully",
      data
    });
  });
  getLast7DaysOrders = this.catchAsync(async (req, res) => {
    const data = await StatisticsService.getLast7DaysOrders();
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Last 7 days orders statistics retrieved successfully",
      data
    });
  });
  getAllOrdersCardMetrics = this.catchAsync(
    async (req, res) => {
      const { from, to } = req.query;
      const data = await StatisticsService.getAllOrdersCardMetrics({
        from,
        to
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Orders metrics retrieved successfully",
        data
      });
    }
  );
  getStatusWiseOrdersMetrics = this.catchAsync(
    async (req, res) => {
      const { order_type } = req.query;
      const data = await StatisticsService.getStatusWiseOrdersMetrics(order_type);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: `Status-wise metrics for ${order_type} orders retrieved successfully`,
        data
      });
    }
  );
  getRecentOrders = this.catchAsync(async (req, res) => {
    const { per_order_limit, total_limit } = req.query;
    const maxTotal = 50;
    const maxPerOrder = 10;
    const parseLimit = (value, defaultVal, max) => {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed <= 0) return defaultVal;
      return Math.min(parsed, max);
    };
    const perOrderLimit = parseLimit(per_order_limit, 5, maxPerOrder);
    const totalLimit = parseLimit(total_limit, 20, maxTotal);
    const data = await StatisticsService.getRecentOrders(
      perOrderLimit,
      totalLimit
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `Recent orders retrieved successfully`,
      data: {
        data,
        meta: {
          per_order_limit: perOrderLimit,
          total_limit: totalLimit,
          total_available: data.length
        }
      }
    });
  });
  getRevenue = this.catchAsync(async (req, res) => {
    const { from, to } = req.query;
    const data = await StatisticsService.getRevenue({
      from,
      to
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `All the orders revenue fetched successfully`,
      data
    });
  });
  getCurrentStockReport = this.catchAsync(
    async (req, res) => {
      const { company_name, category_name, search_query } = req.query;
      const data = await StatisticsService.getCurrentStockReport({
        company_name,
        category_name,
        search_query
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Current stock report retrieved successfully",
        data
      });
    }
  );
  getProductSummaryReport = this.catchAsync(
    async (req, res) => {
      const { productId, start_date, end_date } = req.query;
      const data = await StatisticsService.getProductSummaryReport({
        productId,
        start_date,
        end_date
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Product summary report retrieved successfully",
        data
      });
    }
  );
  getDailySummaryReport = this.catchAsync(
    async (req, res) => {
      const { start_date, end_date } = req.query;
      const data = await StatisticsService.getDailySummaryReport({
        start_date,
        end_date
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Daily summary report retrieved successfully",
        data
      });
    }
  );
  getDailySaleReport = this.catchAsync(async (req, res) => {
    const { start_date, end_date, delivery_man_id } = req.query;
    const data = await StatisticsService.getDailySaleReport({
      start_date,
      end_date,
      delivery_man_id
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily sale report retrieved successfully",
      data
    });
  });
  getDailySaleProductReport = this.catchAsync(
    async (req, res) => {
      const { start_date, end_date, product_id } = req.query;
      const data = await StatisticsService.getDailySaleProductReport({
        start_date,
        end_date,
        product_id
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Daily sale product report retrieved successfully",
        data
      });
    }
  );
  getDamageRecordsReport = this.catchAsync(
    async (req, res) => {
      const { start_date, end_date, status: status2 } = req.query;
      const data = await StatisticsService.getDamageRecordsReport({
        start_date,
        end_date,
        status: status2
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Damage records report retrieved successfully",
        data
      });
    }
  );
};
var StatisticsController = new Controller5();

// src/modules/statistics/statistics.routes.ts
var router6 = (0, import_express6.Router)();
router6.get("/dashboard-summary", StatisticsController.getDashboardSummary);
router6.get("/orders", StatisticsController.getOrdersStatistics);
router6.get("/metrics", StatisticsController.getAllOrdersCardMetrics);
router6.get("/last7days", StatisticsController.getLast7DaysOrders);
router6.get(
  "/status-wise-metrics",
  StatisticsController.getStatusWiseOrdersMetrics
);
router6.get("/revenue", StatisticsController.getRevenue);
router6.get(
  "/reports/current-stock",
  StatisticsController.getCurrentStockReport
);
router6.get(
  "/reports/product-summary",
  StatisticsController.getProductSummaryReport
);
router6.get(
  "/reports/daily-summary",
  StatisticsController.getDailySummaryReport
);
router6.get("/reports/daily-sale", StatisticsController.getDailySaleReport);
router6.get(
  "/reports/daily-sale-products",
  StatisticsController.getDailySaleProductReport
);
router6.get(
  "/reports/damage-records",
  StatisticsController.getDamageRecordsReport
);
var StatisticsRoutes = router6;

// src/modules/users/routes/admin.routes.ts
var import_express7 = require("express");

// src/shared/cookie.ts
init_config();
var CookieManager = class {
  accessTokenName = envConfig.jwt.access_cookie_name;
  refreshTokenName = envConfig.jwt.refresh_cookie_name;
  cookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 1e3 * 60 * 60 * 24 * 365 * 10
  };
  clearCookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true
  };
  setTokens(res, accessToken, refreshToken) {
    res.cookie(this.accessTokenName, accessToken, this.cookieOptions);
    res.cookie(this.refreshTokenName, refreshToken, this.cookieOptions);
  }
  clearTokens(res) {
    res.clearCookie(this.accessTokenName, this.clearCookieOptions);
    res.clearCookie(this.refreshTokenName, this.clearCookieOptions);
  }
};
var cookieManager = new CookieManager();

// src/modules/users/users.controller.ts
var Controller6 = class extends baseController_default {
  getLoggedInUser = this.catchAsync(async (req, res) => {
    const user = await UserService.getLoggedInUser(req?.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Authenticated user retrieved successfully",
      data: user
    });
  });
  createUserByAdmin = this.catchAsync(async (req, res) => {
    const user = await UserService.create(req?.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "A new user created successfully",
      data: user
    });
  });
  getAllUsers = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const filters = pickQueries_default(
      req.query,
      userFilterableFields
    );
    const search_query = req.query.search_query;
    const data = await UserService.getAllUsers(options, filters, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Users retrieved successfully",
      data
    });
  });
  getUserById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await UserService.getUserById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "User retrieved successfully",
      data: user
    });
  });
  changePassword = this.catchAsync(async (req, res) => {
    await UserService.changePassword(req?.user?.id, req.body);
    cookieManager.clearTokens(res);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your password has been changed. Please login to your account",
      data: null
    });
  });
  updateProfilePicture = this.catchAsync(
    async (req, res) => {
      const result = await UserService.updateProfilePicture(
        req?.params?.id,
        req.body.profile_picture
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "User profile picture has been updated successfully",
        data: result
      });
    }
  );
  updateUser = this.catchAsync(async (req, res) => {
    const result = await UserService.updateUserById(req?.params?.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "User has been updated successfully",
      data: result
    });
  });
  deleteAccount = this.catchAsync(async (req, res) => {
    const id = req?.params?.id;
    const result = await UserService.deleteAccount(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "User has been deleted successfully",
      data: result
    });
  });
};
var UserController = new Controller6();

// src/modules/users/users.validate.ts
var import_zod7 = __toESM(require("zod"));
var create2 = import_zod7.default.object({
  body: import_zod7.default.object({
    name: import_zod7.default.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be string/text"
    }).min(3, "Name must be at least 3 characters"),
    phone_number: import_zod7.default.string().nullable().optional(),
    profile_picture: import_zod7.default.string().nullable().optional(),
    email: import_zod7.default.string({ required_error: "Email is required" }).email({ message: "Please provide a valid email" }),
    provider: import_zod7.default.enum([...Object.values(AUTH_PROVIDERS)]).default("email" /* EMAIL */),
    password: import_zod7.default.string().min(6, "Password must be at least 6 characters").max(15, "Password must be less than 15 characters").optional(),
    status: import_zod7.default.enum([...Object.values(USER_STATUS)]).default("active" /* ACTIVE */),
    date_of_birth: import_zod7.default.string().nullable().optional(),
    gender: import_zod7.default.enum(["male", "female"]).nullable().optional()
  }).strict().refine(
    (data) => {
      if (data.provider === "email" /* EMAIL */) {
        return !!data.password && data.password.length > 0;
      }
      return true;
    },
    {
      message: "Password is required for email registered users",
      path: ["password"]
    }
  )
});
var createUserByAdmin = import_zod7.default.object({
  body: import_zod7.default.object({
    name: import_zod7.default.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be string/text"
    }).min(3, "Name must be at least 3 characters"),
    phone_number: import_zod7.default.string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number mus be string"
    }),
    profile_picture: import_zod7.default.string().nullable().optional(),
    email: import_zod7.default.string({ required_error: "Email is required" }).email({ message: "Please provide a valid email" }),
    provider: import_zod7.default.enum([...Object.values(AUTH_PROVIDERS)]).default("email" /* EMAIL */),
    role: import_zod7.default.enum(Object.values(ROLES), {}),
    password: import_zod7.default.string().min(6, "Password must be at least 6 characters").max(15, "Password must be less than 15 characters"),
    status: import_zod7.default.enum([...Object.values(USER_STATUS)]).default("active" /* ACTIVE */),
    date_of_birth: import_zod7.default.string().nullable().optional(),
    gender: import_zod7.default.enum(["male", "female"]).nullable().optional()
  }).strict().refine(
    (data) => {
      if (data.provider === "email" /* EMAIL */) {
        return !!data.password && data.password.length > 0;
      }
      return true;
    },
    {
      message: "Password is required for email registered users",
      path: ["password"]
    }
  )
});
var updateUser = import_zod7.default.object({
  body: import_zod7.default.object({
    name: import_zod7.default.string().optional(),
    phone_number: import_zod7.default.string().optional(),
    profile_picture: import_zod7.default.string().optional(),
    email: import_zod7.default.string().optional(),
    role: import_zod7.default.enum(Object.values(ROLES), {}).optional(),
    provider: import_zod7.default.enum([...Object.values(AUTH_PROVIDERS)]).optional(),
    password: import_zod7.default.string().optional(),
    status: import_zod7.default.enum([...Object.values(USER_STATUS)]).optional(),
    date_of_birth: import_zod7.default.string().optional(),
    gender: import_zod7.default.enum(["male", "female"]).optional()
  }).strict()
});
var setPassword = import_zod7.default.object({
  body: import_zod7.default.object({
    email: import_zod7.default.string({ required_error: "Email is required" }).email({ message: "Please provide a valid email" }),
    password: import_zod7.default.string().min(6, "Password must be at least 6 characters").max(15, "Password must be less than 15 characters")
  })
});
var UserValidations = {
  create: create2,
  createUserByAdmin,
  updateUser,
  setPassword
};

// src/modules/users/routes/admin.routes.ts
var router7 = (0, import_express7.Router)();
router7.route("/").get(
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UserController.getAllUsers
).post(
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(UserValidations.createUserByAdmin),
  UserController.createUserByAdmin
);
router7.route("/:id").get(
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UserController.getUserById
).patch(
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(UserValidations.updateUser),
  UserController.updateUser
).delete(
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UserController.deleteAccount
);
var UserAdminRoutes = router7;

// src/modules/category/category.routes.ts
var import_express8 = require("express");

// src/modules/category/category.model.ts
var import_mongoose10 = require("mongoose");
var categorySchema = new import_mongoose10.Schema(
  {
    name: { type: String, required: true },
    company_name: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  schemaOptions
);
categorySchema.index({ name: 1, company_name: 1 }, { unique: true });
var CategoryModel = (0, import_mongoose10.model)("Category", categorySchema);

// src/modules/category/category.service.ts
var Service10 = class {
  async createCategory(data) {
    const isExist = await CategoryModel.findOne({
      name: data.name,
      company_name: data.company_name
    });
    if (isExist) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "Category already exists for this company"
      );
    }
    return await CategoryModel.create(data);
  }
  async getAllCategories(options, search_query, company_name) {
    const {
      limit = 100,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.name = { $regex: search_query, $options: "i" };
    }
    if (company_name) {
      searchCondition.company_name = company_name;
    }
    const result = await CategoryModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await CategoryModel.countDocuments(searchCondition);
    return {
      meta: { page, limit, total },
      data: result
    };
  }
  async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return category;
  }
  async updateCategory(id, data) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return await CategoryModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  }
  async deleteCategory(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return await CategoryModel.findByIdAndDelete(id);
  }
};
var CategoryService = new Service10();

// src/modules/category/category.controller.ts
var Controller7 = class extends baseController_default {
  createCategory = this.catchAsync(async (req, res) => {
    const data = await CategoryService.createCategory(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Category created successfully",
      data
    });
  });
  getAllCategories = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const company_name = req.query.company_name;
    const data = await CategoryService.getAllCategories(
      options,
      search_query,
      company_name
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Categories retrieved successfully",
      data
    });
  });
  getCategoryById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await CategoryService.getCategoryById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category retrieved successfully",
      data
    });
  });
  updateCategory = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await CategoryService.updateCategory(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category updated successfully",
      data
    });
  });
  deleteCategory = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await CategoryService.deleteCategory(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category deleted successfully",
      data: null
    });
  });
};
var CategoryController = new Controller7();

// src/modules/category/category.validate.ts
var import_zod8 = require("zod");
var createCategoryValidationSchema = import_zod8.z.object({
  body: import_zod8.z.object({
    name: import_zod8.z.string({ required_error: "Category name is required" }),
    company_name: import_zod8.z.string({ required_error: "Company name is required" }),
    status: import_zod8.z.enum(["Active", "Inactive"]).optional()
  })
});
var updateCategoryValidationSchema = import_zod8.z.object({
  body: import_zod8.z.object({
    name: import_zod8.z.string().optional(),
    company_name: import_zod8.z.string().optional(),
    status: import_zod8.z.enum(["Active", "Inactive"]).optional()
  })
});
var categoryValidations = {
  create: createCategoryValidationSchema,
  update: updateCategoryValidationSchema
};

// src/modules/category/category.routes.ts
var router8 = (0, import_express8.Router)();
router8.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(categoryValidations.create),
  CategoryController.createCategory
);
router8.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.getAllCategories
);
router8.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.getCategoryById
);
router8.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(categoryValidations.update),
  CategoryController.updateCategory
);
router8.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.deleteCategory
);
var CategoryRoutes = router8;

// src/modules/product/product.routes.ts
var import_express9 = require("express");

// src/modules/company/company.model.ts
var import_mongoose11 = require("mongoose");
var companySchema = new import_mongoose11.Schema(
  {
    name: { type: String, required: true, unique: true },
    contact: { type: String },
    address: { type: String },
    logo: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  schemaOptions
);
var CompanyModel = (0, import_mongoose11.model)("Company", companySchema);

// src/modules/unit/unit.model.ts
var import_mongoose12 = require("mongoose");
var unitSchema = new import_mongoose12.Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  schemaOptions
);
var UnitModel = (0, import_mongoose12.model)("Unit", unitSchema);

// src/modules/product/product.service.ts
function calculateProductStock(product) {
  if (!product) return null;
  const productObj = product.toObject ? product.toObject() : product;
  const batches = productObj.batches || [];
  const carton_packets = productObj.carton_packets || 1;
  const total_stock = batches.reduce(
    (sum, b) => sum + (Math.round(Number(b.packs_added)) || 0),
    0
  );
  const total_hold_stock = batches.reduce(
    (sum, b) => sum + (Math.round(Number(b.hold_qty)) || 0),
    0
  );
  const total_physical_stock = total_stock + total_hold_stock;
  const total_stock_value = Number(
    batches.reduce(
      (sum, b) => sum + (Number(b.packs_added) || 0) * (Number(b.pack_price) || 0),
      0
    ).toFixed(2)
  );
  const total_hold_stock_value = Number(
    batches.reduce(
      (sum, b) => sum + (Number(b.hold_qty) || 0) * (Number(b.pack_price) || 0),
      0
    ).toFixed(2)
  );
  const total_physical_stock_value = Number(
    (total_stock_value + total_hold_stock_value).toFixed(2)
  );
  let minPurchase = 0;
  let maxPurchase = 0;
  let minSelling = 0;
  let maxSelling = 0;
  if (batches.length > 0) {
    const purchaseRates = batches.map(
      (b) => Number(b.purchase_rate_carton) || 0
    );
    const sellingRates = batches.map(
      (b) => Number(b.selling_rate_carton) || 0
    );
    minPurchase = Math.min(...purchaseRates);
    maxPurchase = Math.max(...purchaseRates);
    minSelling = Math.min(...sellingRates);
    maxSelling = Math.max(...sellingRates);
  }
  let weightedAvgPurchase = 0;
  let weightedAvgSelling = 0;
  const totalPhysicalQty = batches.reduce(
    (sum, b) => sum + (Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0),
    0
  );
  if (totalPhysicalQty > 0) {
    const totalPurchaseWeight = batches.reduce(
      (sum, b) => sum + ((Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0)) * (Number(b.purchase_rate_carton) || 0),
      0
    );
    const totalSellingWeight = batches.reduce(
      (sum, b) => sum + ((Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0)) * (Number(b.selling_rate_carton) || 0),
      0
    );
    weightedAvgPurchase = Number(
      (totalPurchaseWeight / totalPhysicalQty).toFixed(2)
    );
    weightedAvgSelling = Number(
      (totalSellingWeight / totalPhysicalQty).toFixed(2)
    );
  } else if (batches.length > 0) {
    const sumPurchase = batches.reduce(
      (sum, b) => sum + (Number(b.purchase_rate_carton) || 0),
      0
    );
    const sumSelling = batches.reduce(
      (sum, b) => sum + (Number(b.selling_rate_carton) || 0),
      0
    );
    weightedAvgPurchase = Number((sumPurchase / batches.length).toFixed(2));
    weightedAvgSelling = Number((sumSelling / batches.length).toFixed(2));
  }
  let estTotalPurchaseCost = 0;
  let estTotalHoldPurchaseCost = 0;
  let estProfit = 0;
  let estHoldProfit = 0;
  const enrichedBatches = batches.map((b) => {
    const bObj = b.toObject ? b.toObject() : b;
    const batch_id = bObj.batch_id || (bObj._id ? bObj._id.toString() : "");
    const id = bObj.id || batch_id;
    const qty = Number(bObj.packs_added) || 0;
    const hold = Number(bObj.hold_qty) || 0;
    const price = Number(bObj.pack_price) || 0;
    const purchasePricePerPiece = (Number(bObj.purchase_rate_carton) || 0) / carton_packets;
    const packs_total_price = Number((qty * price).toFixed(2));
    const purchase_cost = Number((qty * purchasePricePerPiece).toFixed(2));
    const profit = Number((packs_total_price - purchase_cost).toFixed(2));
    const hold_total_price = Number((hold * price).toFixed(2));
    const hold_purchase_cost = Number(
      (hold * purchasePricePerPiece).toFixed(2)
    );
    const hold_profit = Number(
      (hold_total_price - hold_purchase_cost).toFixed(2)
    );
    estTotalPurchaseCost = Number(
      (estTotalPurchaseCost + purchase_cost).toFixed(2)
    );
    estTotalHoldPurchaseCost = Number(
      (estTotalHoldPurchaseCost + hold_purchase_cost).toFixed(2)
    );
    estProfit = Number((estProfit + profit).toFixed(2));
    estHoldProfit = Number((estHoldProfit + hold_profit).toFixed(2));
    return {
      id,
      batch_id,
      ...bObj,
      packs_total_price,
      purchase_cost,
      profit,
      hold_total_price,
      hold_purchase_cost,
      hold_profit
    };
  });
  let profitMarginPercent = 0;
  if (estTotalPurchaseCost > 0) {
    profitMarginPercent = Number(
      (estProfit / estTotalPurchaseCost * 100).toFixed(2)
    );
  } else if (total_stock_value > 0) {
    profitMarginPercent = 100;
  }
  const has_box_size = !!productObj.box_size && productObj.box_size < carton_packets;
  const box_size = has_box_size ? productObj.box_size : carton_packets;
  const cartons = Math.floor(total_stock / carton_packets);
  const remainingAfterCartons = total_stock % carton_packets;
  const boxes = has_box_size ? Math.floor(remainingAfterCartons / box_size) : 0;
  const pieces = has_box_size ? remainingAfterCartons % box_size : remainingAfterCartons;
  const equivalent_stock = `${cartons} Ctn${has_box_size ? `, ${boxes} Box` : ""}, ${pieces} Pcs`;
  const hold_cartons = Math.floor(total_hold_stock / carton_packets);
  const hold_remaining = total_hold_stock % carton_packets;
  const hold_boxes = has_box_size ? Math.floor(hold_remaining / box_size) : 0;
  const hold_pieces = has_box_size ? hold_remaining % box_size : hold_remaining;
  const equivalent_hold_stock = `${hold_cartons} Ctn${has_box_size ? `, ${hold_boxes} Box` : ""}, ${hold_pieces} Pcs`;
  return {
    ...productObj,
    total_stock,
    total_hold_stock,
    total_physical_stock,
    total_stock_value,
    total_hold_stock_value,
    total_physical_stock_value,
    minPurchase,
    maxPurchase,
    minSelling,
    maxSelling,
    weightedAvgPurchase,
    weightedAvgSelling,
    estTotalPurchaseCost,
    estTotalHoldPurchaseCost,
    estProfit,
    estHoldProfit,
    profitMarginPercent,
    cartons,
    boxes,
    pieces,
    hold_cartons,
    hold_boxes,
    hold_pieces,
    has_box_size,
    equivalent_stock,
    equivalent_hold_stock,
    batches: enrichedBatches
  };
}
var Service11 = class {
  async createProduct(data) {
    const isExist = await ProductModel.findOne({
      name: data.name,
      category_name: data.category_name,
      company_name: data.company_name
    });
    if (isExist) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "Product with this name already exists for this company in this category"
      );
    }
    if (data.batches) {
      data.batches = data.batches.map((b) => {
        if (!b.batch_id || !b.batch_id.startsWith("BAT-")) {
          b.batch_id = generateBatchId();
        }
        return b;
      });
    }
    if (data.category_name) {
      await CategoryModel.findOneAndUpdate(
        { name: data.category_name },
        { name: data.category_name, status: "Active" },
        { upsert: true, new: true }
      );
    }
    if (data.company_name) {
      await CompanyModel.findOneAndUpdate(
        { name: data.company_name },
        { name: data.company_name, status: "Active" },
        { upsert: true, new: true }
      );
    }
    if (data.unit) {
      await UnitModel.findOneAndUpdate(
        { name: data.unit },
        { name: data.unit, status: "Active" },
        { upsert: true, new: true }
      );
    }
    const created = await ProductModel.create(data);
    return calculateProductStock(created);
  }
  async getAllProducts(options, search_query) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { company_name: { $regex: search_query, $options: "i" } },
        { category_name: { $regex: search_query, $options: "i" } }
      ];
    }
    const result = await ProductModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await ProductModel.countDocuments(searchCondition);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result.map(calculateProductStock)
    };
  }
  async getProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    return calculateProductStock(product);
  }
  async updateProduct(id, data) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    if (data.name || data.category_name || data.company_name) {
      const nameToCheck = data.name || product.name;
      const categoryToCheck = data.category_name || product.category_name;
      const companyToCheck = data.company_name || product.company_name;
      const isExist = await ProductModel.findOne({
        name: nameToCheck,
        category_name: categoryToCheck,
        company_name: companyToCheck,
        _id: { $ne: id }
      });
      if (isExist) {
        throw new error_default(
          HttpStatusCode.CONFLICT,
          "Product with this name already exists for this company in this category"
        );
      }
    }
    if (data.batches) {
      data.batches = data.batches.map((b) => {
        if (!b.batch_id || !b.batch_id.startsWith("BAT-")) {
          b.batch_id = generateBatchId();
        }
        return b;
      });
    }
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
    return calculateProductStock(updated);
  }
  async deleteProduct(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    return await ProductModel.findByIdAndDelete(id);
  }
  async addBatch(productId, batch) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    if (!batch.batch_id || !batch.batch_id.startsWith("BAT-")) {
      batch.batch_id = generateBatchId();
    }
    product.batches.push(batch);
    const saved = await product.save();
    return calculateProductStock(saved);
  }
};
var ProductService = new Service11();

// src/modules/product/product.controller.ts
var Controller8 = class extends baseController_default {
  createProduct = this.catchAsync(async (req, res) => {
    const data = await ProductService.createProduct(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Product created successfully",
      data
    });
  });
  getAllProducts = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await ProductService.getAllProducts(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Products retrieved successfully",
      data
    });
  });
  getProductById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await ProductService.getProductById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product retrieved successfully",
      data
    });
  });
  updateProduct = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await ProductService.updateProduct(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product updated successfully",
      data
    });
  });
  deleteProduct = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await ProductService.deleteProduct(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product deleted successfully",
      data: null
    });
  });
  addBatch = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await ProductService.addBatch(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Batch added successfully",
      data
    });
  });
};
var ProductController = new Controller8();

// src/modules/product/product.validate.ts
var import_zod9 = require("zod");
var batchValidationSchema = import_zod9.z.object({
  _id: import_zod9.z.string().optional(),
  id: import_zod9.z.string().optional(),
  batch_id: import_zod9.z.string().optional(),
  packs_added: import_zod9.z.number({ required_error: "Packs added is required" }).int("Packs added must be an integer"),
  pack_price: import_zod9.z.number({ required_error: "Pack price is required" }),
  packs_total_price: import_zod9.z.number().optional(),
  purchase_rate_carton: import_zod9.z.number({
    required_error: "Purchase rate per carton is required"
  }),
  selling_rate_carton: import_zod9.z.number({
    required_error: "Selling rate per carton is required"
  }),
  dateAdded: import_zod9.z.string().optional()
});
var createBatchValidationSchema = import_zod9.z.object({
  body: batchValidationSchema
});
var createProductValidationSchema = import_zod9.z.object({
  body: import_zod9.z.object({
    name: import_zod9.z.string({ required_error: "Product name is required" }),
    weight: import_zod9.z.number({ required_error: "Product weight is required" }),
    unit: import_zod9.z.string({ required_error: "Unit is required" }),
    product_summary: import_zod9.z.string().optional(),
    carton_packets: import_zod9.z.number({ required_error: "Carton packets quantity is required" }).int("Carton packets quantity must be an integer"),
    box_size: import_zod9.z.number().int("Box size must be an integer").optional(),
    company_name: import_zod9.z.string({ required_error: "Company name is required" }),
    category_name: import_zod9.z.string({ required_error: "Category name is required" }),
    lowStockThreshold: import_zod9.z.number({ required_error: "Low stock threshold is required" }).int("Low stock threshold must be an integer"),
    batches: import_zod9.z.array(batchValidationSchema).optional()
  })
});
var updateProductValidationSchema = import_zod9.z.object({
  body: import_zod9.z.object({
    name: import_zod9.z.string().optional(),
    weight: import_zod9.z.number().optional(),
    unit: import_zod9.z.string().optional(),
    product_summary: import_zod9.z.string().optional(),
    carton_packets: import_zod9.z.number().int("Carton packets quantity must be an integer").optional(),
    box_size: import_zod9.z.number().int("Box size must be an integer").optional(),
    company_name: import_zod9.z.string().optional(),
    category_name: import_zod9.z.string().optional(),
    lowStockThreshold: import_zod9.z.number().int("Low stock threshold must be an integer").optional(),
    batches: import_zod9.z.array(batchValidationSchema).optional()
  })
});
var productValidations = {
  create: createProductValidationSchema,
  update: updateProductValidationSchema,
  addBatch: createBatchValidationSchema
};

// src/modules/product/product.routes.ts
var router9 = (0, import_express9.Router)();
router9.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(productValidations.create),
  ProductController.createProduct
);
router9.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  ProductController.getAllProducts
);
router9.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  ProductController.getProductById
);
router9.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(productValidations.update),
  ProductController.updateProduct
);
router9.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  ProductController.deleteProduct
);
router9.post(
  "/:id/batches",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(productValidations.addBatch),
  ProductController.addBatch
);
var ProductRoutes = router9;

// src/modules/unit/unit.routes.ts
var import_express10 = require("express");

// src/modules/unit/unit.service.ts
var Service12 = class {
  async createUnit(data) {
    const isExist = await UnitModel.findOne({ name: data.name });
    if (isExist) {
      throw new error_default(HttpStatusCode.CONFLICT, "Unit already exists");
    }
    return await UnitModel.create(data);
  }
  async getAllUnits(options, search_query) {
    const {
      limit = 100,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.name = { $regex: search_query, $options: "i" };
    }
    const result = await UnitModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await UnitModel.countDocuments(searchCondition);
    return {
      meta: { page, limit, total },
      data: result
    };
  }
  async getUnitById(id) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return unit;
  }
  async updateUnit(id, data) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return await UnitModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }
  async deleteUnit(id) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return await UnitModel.findByIdAndDelete(id);
  }
};
var UnitService = new Service12();

// src/modules/unit/unit.controller.ts
var Controller9 = class extends baseController_default {
  createUnit = this.catchAsync(async (req, res) => {
    const data = await UnitService.createUnit(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Unit created successfully",
      data
    });
  });
  getAllUnits = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await UnitService.getAllUnits(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Units retrieved successfully",
      data
    });
  });
  getUnitById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await UnitService.getUnitById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit retrieved successfully",
      data
    });
  });
  updateUnit = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await UnitService.updateUnit(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit updated successfully",
      data
    });
  });
  deleteUnit = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await UnitService.deleteUnit(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit deleted successfully",
      data: null
    });
  });
};
var UnitController = new Controller9();

// src/modules/unit/unit.validate.ts
var import_zod10 = require("zod");
var createUnitValidationSchema = import_zod10.z.object({
  body: import_zod10.z.object({
    name: import_zod10.z.string({ required_error: "Unit name is required" }),
    status: import_zod10.z.enum(["Active", "Inactive"]).optional()
  })
});
var updateUnitValidationSchema = import_zod10.z.object({
  body: import_zod10.z.object({
    name: import_zod10.z.string().optional(),
    status: import_zod10.z.enum(["Active", "Inactive"]).optional()
  })
});
var unitValidations = {
  create: createUnitValidationSchema,
  update: updateUnitValidationSchema
};

// src/modules/unit/unit.routes.ts
var router10 = (0, import_express10.Router)();
router10.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(unitValidations.create),
  UnitController.createUnit
);
router10.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UnitController.getAllUnits
);
router10.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UnitController.getUnitById
);
router10.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(unitValidations.update),
  UnitController.updateUnit
);
router10.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  UnitController.deleteUnit
);
var UnitRoutes = router10;

// src/modules/company/company.routes.ts
var import_express11 = require("express");

// src/modules/company/company.service.ts
var Service13 = class {
  async createCompany(data) {
    const isExist = await CompanyModel.findOne({ name: data.name });
    if (isExist) {
      throw new error_default(HttpStatusCode.CONFLICT, "Company already exists");
    }
    return await CompanyModel.create(data);
  }
  async getAllCompanies(options, search_query) {
    const {
      limit = 100,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.name = { $regex: search_query, $options: "i" };
    }
    const result = await CompanyModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await CompanyModel.countDocuments(searchCondition);
    return {
      meta: { page, limit, total },
      data: result
    };
  }
  async getCompanyById(id) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return company;
  }
  async updateCompany(id, data) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return await CompanyModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }
  async deleteCompany(id) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return await CompanyModel.findByIdAndDelete(id);
  }
};
var CompanyService = new Service13();

// src/modules/company/company.controller.ts
var Controller10 = class extends baseController_default {
  createCompany = this.catchAsync(async (req, res) => {
    const data = await CompanyService.createCompany(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Company created successfully",
      data
    });
  });
  getAllCompanies = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await CompanyService.getAllCompanies(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Companies retrieved successfully",
      data
    });
  });
  getCompanyById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await CompanyService.getCompanyById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company retrieved successfully",
      data
    });
  });
  updateCompany = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await CompanyService.updateCompany(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company updated successfully",
      data
    });
  });
  deleteCompany = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await CompanyService.deleteCompany(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company deleted successfully",
      data: null
    });
  });
};
var CompanyController = new Controller10();

// src/modules/company/company.validate.ts
var import_zod11 = require("zod");
var createCompanyValidationSchema = import_zod11.z.object({
  body: import_zod11.z.object({
    name: import_zod11.z.string({ required_error: "Company name is required" }),
    contact: import_zod11.z.string().optional(),
    address: import_zod11.z.string().optional(),
    logo: import_zod11.z.string().optional().nullable(),
    status: import_zod11.z.enum(["Active", "Inactive"]).optional()
  })
});
var updateCompanyValidationSchema = import_zod11.z.object({
  body: import_zod11.z.object({
    name: import_zod11.z.string().optional(),
    contact: import_zod11.z.string().optional(),
    address: import_zod11.z.string().optional(),
    logo: import_zod11.z.string().optional().nullable(),
    status: import_zod11.z.enum(["Active", "Inactive"]).optional()
  })
});
var companyValidations = {
  create: createCompanyValidationSchema,
  update: updateCompanyValidationSchema
};

// src/modules/company/company.routes.ts
var router11 = (0, import_express11.Router)();
router11.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(companyValidations.create),
  CompanyController.createCompany
);
router11.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.getAllCompanies
);
router11.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.getCompanyById
);
router11.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(companyValidations.update),
  CompanyController.updateCompany
);
router11.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.deleteCompany
);
var CompanyRoutes = router11;

// src/modules/delivery-man/delivery-man.routes.ts
var import_express12 = require("express");

// src/modules/delivery-man/delivery-man.model.ts
var import_mongoose13 = require("mongoose");
var deliveryManSchema = new import_mongoose13.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    nid: { type: String, required: true },
    address: { type: String, required: true },
    profile: { type: String }
  },
  schemaOptions
);
var DeliveryManModel = (0, import_mongoose13.model)("DeliveryMan", deliveryManSchema);

// src/modules/delivery-man/delivery-man.service.ts
var Service14 = class {
  async createDeliveryMan(data) {
    const isExist = await DeliveryManModel.findOne({ phone: data.phone });
    if (isExist) {
      throw new error_default(
        HttpStatusCode.CONFLICT,
        "Delivery Man with this phone number already exists"
      );
    }
    return await DeliveryManModel.create(data);
  }
  async getAllDeliveryMen(options, search_query) {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { phone: { $regex: search_query, $options: "i" } },
        { nid: { $regex: search_query, $options: "i" } }
      ];
    }
    const result = await DeliveryManModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await DeliveryManModel.countDocuments(searchCondition);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    };
  }
  async getDeliveryManById(id) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return deliveryMan;
  }
  async updateDeliveryMan(id, data) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return await DeliveryManModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  }
  async deleteDeliveryMan(id) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return await DeliveryManModel.findByIdAndDelete(id);
  }
  async getDeliveryManStats(id) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new error_default(
        HttpStatusCode.NOT_FOUND,
        "Delivery representative not found"
      );
    }
    const totalChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id
    });
    const settledChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id,
      status: "settled"
    });
    const pendingChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id,
      status: "loaded"
    });
    const settlementSummary = await SettlementModel.aggregate([
      { $match: { deliveryManId: id } },
      {
        $group: {
          _id: null,
          totalLoaded: { $sum: "$totalLoaded" },
          totalSold: { $sum: "$totalSold" },
          totalReturned: { $sum: "$totalReturned" },
          totalDamaged: { $sum: "$totalDamaged" },
          totalSales: { $sum: "$totalSales" },
          totalProfit: { $sum: "$totalProfit" },
          totalLoss: { $sum: "$totalLoss" }
        }
      }
    ]);
    const summary = settlementSummary[0] || {
      totalLoaded: 0,
      totalSold: 0,
      totalReturned: 0,
      totalDamaged: 0,
      totalSales: 0,
      totalProfit: 0,
      totalLoss: 0
    };
    const loadingSheets = await LoadingSheetModel.find({ delivery_man_id: id }).sort({ createdAt: -1 }).lean();
    const challans = [];
    for (const sheet of loadingSheets) {
      const settlement = await SettlementModel.findOne({
        loadingSheetId: sheet._id.toString()
      }).lean();
      challans.push({
        id: sheet._id.toString(),
        invoiceNo: sheet.invoice_no || `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
        date: sheet.loading_date ? new Date(sheet.loading_date).toISOString().slice(0, 10) : "",
        route: sheet.route || "N/A",
        status: sheet.status,
        settlement: settlement ? {
          id: settlement._id.toString(),
          invoiceNo: settlement.invoiceNo || `SET-${settlement._id.toString().slice(-6).toUpperCase()}`,
          date: settlement.date,
          totalSales: settlement.totalSales,
          totalProfit: settlement.totalProfit,
          totalLoss: settlement.totalLoss,
          totalLoaded: settlement.totalLoaded,
          totalSold: settlement.totalSold,
          totalReturned: settlement.totalReturned,
          totalDamaged: settlement.totalDamaged
        } : null
      });
    }
    return {
      deliveryMan,
      summary: {
        totalChallans,
        settledChallans,
        pendingChallans,
        ...summary
      },
      challans
    };
  }
};
var DeliveryManService = new Service14();

// src/modules/delivery-man/delivery-man.controller.ts
var Controller11 = class extends baseController_default {
  createDeliveryMan = this.catchAsync(async (req, res) => {
    const data = await DeliveryManService.createDeliveryMan(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Delivery representative created successfully",
      data
    });
  });
  getAllDeliveryMen = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await DeliveryManService.getAllDeliveryMen(
      options,
      search_query
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representatives retrieved successfully",
      data
    });
  });
  getDeliveryManById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await DeliveryManService.getDeliveryManById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative retrieved successfully",
      data
    });
  });
  getDeliveryManStats = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await DeliveryManService.getDeliveryManStats(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative statistics retrieved successfully",
      data
    });
  });
  updateDeliveryMan = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await DeliveryManService.updateDeliveryMan(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative updated successfully",
      data
    });
  });
  deleteDeliveryMan = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await DeliveryManService.deleteDeliveryMan(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative deleted successfully",
      data: null
    });
  });
};
var DeliveryManController = new Controller11();

// src/modules/delivery-man/delivery-man.validate.ts
var import_zod12 = require("zod");
var createDeliveryManValidationSchema = import_zod12.z.object({
  body: import_zod12.z.object({
    name: import_zod12.z.string({ required_error: "Name is required" }),
    phone: import_zod12.z.string({ required_error: "Phone is required" }),
    status: import_zod12.z.enum(["active", "inactive"]).optional(),
    nid: import_zod12.z.string({ required_error: "NID is required" }),
    address: import_zod12.z.string({ required_error: "Address is required" }),
    profile: import_zod12.z.string().optional()
  })
});
var updateDeliveryManValidationSchema = import_zod12.z.object({
  body: import_zod12.z.object({
    name: import_zod12.z.string().optional(),
    phone: import_zod12.z.string().optional(),
    status: import_zod12.z.enum(["active", "inactive"]).optional(),
    nid: import_zod12.z.string().optional(),
    address: import_zod12.z.string().optional(),
    profile: import_zod12.z.string().optional()
  })
});
var deliveryManValidations = {
  create: createDeliveryManValidationSchema,
  update: updateDeliveryManValidationSchema
};

// src/modules/delivery-man/delivery-man.routes.ts
var router12 = (0, import_express12.Router)();
router12.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(deliveryManValidations.create),
  DeliveryManController.createDeliveryMan
);
router12.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getAllDeliveryMen
);
router12.get(
  "/:id/stats",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getDeliveryManStats
);
router12.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getDeliveryManById
);
router12.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(deliveryManValidations.update),
  DeliveryManController.updateDeliveryMan
);
router12.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.deleteDeliveryMan
);
var DeliveryManRoutes = router12;

// src/modules/loading-sheet/loading-sheet.routes.ts
var import_express13 = require("express");

// src/modules/loading-sheet/loading-sheet.service.ts
var import_mongoose14 = __toESM(require("mongoose"));
async function runTransactionWithFallback(fn) {
  let session;
  try {
    session = await import_mongoose14.default.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (error) {
    const isNotSupported = error.message?.includes("transaction") || error.message?.includes("replica set") || error.message?.includes("standalone") || error.code === 20 || error.code === 263;
    if (isNotSupported) {
      console.warn(
        "\u26A0\uFE0F Mongoose transactions are not supported on this MongoDB deployment. Falling back to non-transactional execution with OCC."
      );
      return await fn();
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
var Service15 = class {
  async createLoadingSheet(data) {
    return await runTransactionWithFallback(async (session) => {
      const deliveryMan = await DeliveryManModel.findById(
        data.deliveryManId
      ).session(session || null);
      if (!deliveryMan) {
        throw new error_default(
          HttpStatusCode.NOT_FOUND,
          "Delivery representative not found"
        );
      }
      if (deliveryMan.status !== "active") {
        throw new error_default(
          HttpStatusCode.BAD_REQUEST,
          "Selected delivery representative is inactive"
        );
      }
      const loadingSheetDoc = new LoadingSheetModel({
        delivery_man_id: data.deliveryManId,
        delivery_man_name: data.deliveryManName,
        status: data.status || "loaded",
        loading_date: data.date ? new Date(data.date) : /* @__PURE__ */ new Date(),
        route: data.route
      });
      const savedSheet = await loadingSheetDoc.save({ session });
      const items = data.items || [];
      for (const item of items) {
        const product = await ProductModel.findById(item.productId).session(
          session || null
        );
        if (!product) {
          throw new error_default(
            HttpStatusCode.NOT_FOUND,
            `Product not found: ${item.productName}`
          );
        }
        const totalAvailable = product.batches.reduce(
          (sum, b) => sum + (Number(b.packs_added) || 0),
          0
        );
        if (totalAvailable < item.quantity) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `Insufficient stock for product ${product.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`
          );
        }
        product.batches.sort(
          (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );
        let qtyNeeded = item.quantity;
        for (const batch of product.batches) {
          if (qtyNeeded <= 0) break;
          const available = Number(batch.packs_added) || 0;
          if (available <= 0) continue;
          const allocated = Math.min(qtyNeeded, available);
          const cartonPackets = product.carton_packets || 1;
          const purchasePrice = Number(batch.purchase_rate_carton) / cartonPackets;
          const sellingPrice = Number(batch.pack_price) || 0;
          const detail = new LoadingSheetDetailModel({
            loading_sheet_id: savedSheet._id,
            product_id: product._id.toString(),
            product_name: product.name,
            batch_id: batch._id,
            loaded_qty: allocated,
            sold_qty: 0,
            returned_qty: 0,
            damaged_qty: 0,
            free_qty: 0,
            purchase_price: purchasePrice,
            selling_price: sellingPrice
          });
          await detail.save({ session });
          batch.packs_added = available - allocated;
          batch.hold_qty = (Number(batch.hold_qty) || 0) + allocated;
          qtyNeeded -= allocated;
        }
        await product.save({ session });
      }
      return await this.getLoadingSheetById(savedSheet._id.toString(), session);
    });
  }
  async getAllLoadingSheets(options, search_query) {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.$or = [
        { delivery_man_name: { $regex: search_query, $options: "i" } },
        { route: { $regex: search_query, $options: "i" } },
        { status: { $regex: search_query, $options: "i" } }
      ];
    }
    const sheets = await LoadingSheetModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit).lean();
    const result = [];
    for (const sheet of sheets) {
      const details = await LoadingSheetDetailModel.find({
        loading_sheet_id: sheet._id
      }).lean();
      const items = this.groupDetailsToItems(details);
      const totalCost = items.reduce(
        (s, i) => s + i.quantity * i.purchasePrice,
        0
      );
      const totalExpectedSales = items.reduce(
        (s, i) => s + i.quantity * i.sellingPrice,
        0
      );
      result.push({
        id: sheet._id.toString(),
        invoiceNo: sheet.invoice_no || `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
        date: sheet.loading_date ? new Date(sheet.loading_date).toISOString().slice(0, 10) : "",
        deliveryManName: sheet.delivery_man_name,
        deliveryManId: sheet.delivery_man_id,
        route: sheet.route,
        status: sheet.status,
        items,
        totalCost,
        totalExpectedSales
      });
    }
    const total = await LoadingSheetModel.countDocuments(searchCondition);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    };
  }
  async getLoadingSheetById(id, session) {
    const sheet = await LoadingSheetModel.findById(id).session(session || null).lean();
    if (!sheet) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
    }
    const details = await LoadingSheetDetailModel.find({
      loading_sheet_id: sheet._id
    }).session(session || null).lean();
    const items = this.groupDetailsToItems(details);
    const totalCost = items.reduce(
      (s, i) => s + i.quantity * i.purchasePrice,
      0
    );
    const totalExpectedSales = items.reduce(
      (s, i) => s + i.quantity * i.sellingPrice,
      0
    );
    return {
      id: sheet._id.toString(),
      invoiceNo: sheet.invoice_no || `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
      date: sheet.loading_date ? new Date(sheet.loading_date).toISOString().slice(0, 10) : "",
      deliveryManName: sheet.delivery_man_name,
      deliveryManId: sheet.delivery_man_id,
      route: sheet.route,
      status: sheet.status,
      items,
      totalCost,
      totalExpectedSales
    };
  }
  async updateLoadingSheet(id, data) {
    return await runTransactionWithFallback(async (session) => {
      const sheet = await LoadingSheetModel.findById(id).session(
        session || null
      );
      if (!sheet) {
        throw new error_default(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }
      if (data.deliveryManId !== void 0)
        sheet.delivery_man_id = data.deliveryManId;
      if (data.deliveryManName !== void 0)
        sheet.delivery_man_name = data.deliveryManName;
      if (data.status !== void 0) sheet.status = data.status;
      if (data.route !== void 0) sheet.route = data.route;
      if (data.date !== void 0) sheet.loading_date = new Date(data.date);
      await sheet.save({ session });
      return await this.getLoadingSheetById(id, session);
    });
  }
  async deleteLoadingSheet(id) {
    return await runTransactionWithFallback(async (session) => {
      const sheet = await LoadingSheetModel.findById(id).session(
        session || null
      );
      if (!sheet) {
        throw new error_default(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }
      if (sheet.status !== "settled") {
        const details = await LoadingSheetDetailModel.find({
          loading_sheet_id: sheet._id
        }).session(session || null);
        for (const detail of details) {
          const product = await ProductModel.findById(
            detail.product_id
          ).session(session || null);
          if (product) {
            const batch = product.batches.find(
              (b) => b._id?.toString() === detail.batch_id.toString()
            );
            if (batch) {
              const hold = Number(batch.hold_qty) || 0;
              const currentAvailable = Number(batch.packs_added) || 0;
              const loaded = Number(detail.loaded_qty) || 0;
              batch.hold_qty = Math.max(0, hold - loaded);
              batch.packs_added = currentAvailable + Math.min(hold, loaded);
              await product.save({ session });
            }
          }
        }
      }
      await LoadingSheetDetailModel.deleteMany({
        loading_sheet_id: sheet._id
      }).session(session || null);
      await LoadingSheetModel.findByIdAndDelete(sheet._id).session(
        session || null
      );
      return null;
    });
  }
  /**
   * Reconstructs a list of product-level items from batch-wise details.
   */
  groupDetailsToItems(details) {
    const itemsMap = {};
    for (const d of details) {
      const prodId = d.product_id;
      if (!itemsMap[prodId]) {
        itemsMap[prodId] = {
          productId: prodId,
          productName: d.product_name,
          quantity: 0,
          purchasePrice: d.purchase_price,
          sellingPrice: d.selling_price,
          soldQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          freeQuantity: 0
        };
      }
      itemsMap[prodId].quantity += Number(d.loaded_qty) || 0;
      itemsMap[prodId].soldQuantity += Number(d.sold_qty) || 0;
      itemsMap[prodId].returnedQuantity += Number(d.returned_qty) || 0;
      itemsMap[prodId].damagedQuantity += Number(d.damaged_qty) || 0;
      itemsMap[prodId].freeQuantity += Number(d.free_qty) || 0;
    }
    return Object.values(itemsMap);
  }
};
var LoadingSheetService = new Service15();

// src/modules/loading-sheet/loading-sheet.controller.ts
var Controller12 = class extends baseController_default {
  createLoadingSheet = this.catchAsync(async (req, res) => {
    const data = await LoadingSheetService.createLoadingSheet(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Loading sheet created successfully",
      data
    });
  });
  getAllLoadingSheets = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await LoadingSheetService.getAllLoadingSheets(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheets retrieved successfully",
      data
    });
  });
  getLoadingSheetById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await LoadingSheetService.getLoadingSheetById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet retrieved successfully",
      data
    });
  });
  updateLoadingSheet = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await LoadingSheetService.updateLoadingSheet(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet updated successfully",
      data
    });
  });
  deleteLoadingSheet = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await LoadingSheetService.deleteLoadingSheet(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet deleted successfully",
      data: null
    });
  });
};
var LoadingSheetController = new Controller12();

// src/modules/loading-sheet/loading-sheet.validate.ts
var import_zod13 = require("zod");
var loadingSheetItemValidationSchema = import_zod13.z.object({
  productId: import_zod13.z.string({ required_error: "Product ID is required" }),
  productName: import_zod13.z.string({ required_error: "Product name is required" }),
  quantity: import_zod13.z.number({ required_error: "Quantity is required" }).int("Quantity must be an integer"),
  purchasePrice: import_zod13.z.number({ required_error: "Purchase price is required" }),
  sellingPrice: import_zod13.z.number({ required_error: "Selling price is required" })
});
var createLoadingSheetValidationSchema = import_zod13.z.object({
  body: import_zod13.z.object({
    date: import_zod13.z.string({ required_error: "Date is required" }),
    deliveryManName: import_zod13.z.string({
      required_error: "Delivery representative name is required"
    }),
    deliveryManId: import_zod13.z.string({
      required_error: "Delivery representative ID is required"
    }),
    route: import_zod13.z.string().optional(),
    items: import_zod13.z.array(loadingSheetItemValidationSchema, {
      required_error: "Items are required"
    }),
    status: import_zod13.z.enum(["loading", "loaded", "in_transit", "settled"]).optional()
  })
});
var updateLoadingSheetValidationSchema = import_zod13.z.object({
  body: import_zod13.z.object({
    date: import_zod13.z.string().optional(),
    deliveryManName: import_zod13.z.string().optional(),
    deliveryManId: import_zod13.z.string().optional(),
    route: import_zod13.z.string().optional(),
    status: import_zod13.z.enum(["loading", "loaded", "in_transit", "settled"]).optional()
  })
});
var loadingSheetValidations = {
  create: createLoadingSheetValidationSchema,
  update: updateLoadingSheetValidationSchema
};

// src/modules/loading-sheet/loading-sheet.routes.ts
var router13 = (0, import_express13.Router)();
router13.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(loadingSheetValidations.create),
  LoadingSheetController.createLoadingSheet
);
router13.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.getAllLoadingSheets
);
router13.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.getLoadingSheetById
);
router13.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(loadingSheetValidations.update),
  LoadingSheetController.updateLoadingSheet
);
router13.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.deleteLoadingSheet
);
var LoadingSheetRoutes = router13;

// src/modules/settlement/settlement.routes.ts
var import_express14 = require("express");

// src/modules/settlement/settlement.service.ts
var import_mongoose16 = __toESM(require("mongoose"));

// src/modules/settlement/sale-batch-detail.model.ts
var import_mongoose15 = require("mongoose");
var saleBatchDetailSchema = new import_mongoose15.Schema(
  {
    sale_id: {
      type: import_mongoose15.Schema.Types.ObjectId,
      ref: "Settlement",
      required: true
    },
    batch_id: { type: import_mongoose15.Schema.Types.ObjectId, required: true },
    qty: { type: Number, required: true },
    purchase_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    revenue: { type: Number, required: true },
    cost: { type: Number, required: true },
    profit: { type: Number, required: true }
  },
  schemaOptions
);
var SaleBatchDetailModel = (0, import_mongoose15.model)(
  "SaleBatchDetail",
  saleBatchDetailSchema
);

// src/modules/settlement/settlement.service.ts
var Service16 = class {
  async createSettlement(data) {
    const settlementId = new import_mongoose16.default.Types.ObjectId();
    return await runTransactionWithFallback(async (session) => {
      const loadingSheet = await LoadingSheetModel.findById(
        data.loadingSheetId
      ).session(session || null);
      if (!loadingSheet) {
        throw new error_default(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }
      if (loadingSheet.status === "settled") {
        throw new error_default(
          HttpStatusCode.BAD_REQUEST,
          "Loading sheet is already settled"
        );
      }
      let totalLoaded = 0;
      let totalSold = 0;
      let totalReturned = 0;
      let totalDamaged = 0;
      let totalSales = 0;
      let totalCostOfSales = 0;
      let totalLoss = 0;
      const items = data.items || [];
      const updatedItems = [];
      for (const item of items) {
        const loadedQty = Number(item.loadedQuantity) || 0;
        const soldQty = Number(item.soldQuantity) || 0;
        const returnedQty = Number(item.returnedQuantity) || 0;
        const damagedQty = Number(item.damagedQuantity) || 0;
        const freeQty = Number(item.freeQuantity) || 0;
        if (loadedQty !== soldQty + returnedQty + damagedQty + freeQty) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `Quantities do not match loaded quantity for product ${item.productName}. Loaded: ${loadedQty}, Sum: ${soldQty + returnedQty + damagedQty + freeQty}`
          );
        }
        const details = await LoadingSheetDetailModel.find({
          loading_sheet_id: loadingSheet._id,
          product_id: item.productId
        }).session(session || null).sort({ createdAt: 1 });
        if (details.length === 0) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `No loading sheet details found for product ${item.productName}`
          );
        }
        let remainingReturned = returnedQty;
        let remainingDamaged = damagedQty;
        let remainingFree = freeQty;
        for (const detail of details) {
          const detailLoaded = Number(detail.loaded_qty) || 0;
          const ret = Math.min(remainingReturned, detailLoaded);
          detail.returned_qty = ret;
          remainingReturned -= ret;
          const dmg = Math.min(remainingDamaged, detailLoaded - ret);
          detail.damaged_qty = dmg;
          remainingDamaged -= dmg;
          const free = Math.min(remainingFree, detailLoaded - ret - dmg);
          detail.free_qty = free;
          remainingFree -= free;
          const sold = detailLoaded - ret - dmg - free;
          detail.sold_qty = sold;
          await detail.save({ session });
          const product = await ProductModel.findById(
            detail.product_id
          ).session(session || null);
          if (product) {
            const batch = product.batches.find(
              (b) => b._id?.toString() === detail.batch_id.toString()
            );
            if (batch) {
              const currentHold = Number(batch.hold_qty) || 0;
              batch.hold_qty = Math.max(0, currentHold - detailLoaded);
              const currentAvailable = Number(batch.packs_added) || 0;
              batch.packs_added = currentAvailable + ret;
              await product.save({ session });
            }
          }
          if (dmg > 0) {
            const lossAmount = Number((dmg * detail.purchase_price).toFixed(2));
            const damageRecord = new DamageRecordModel({
              damage_number: generateDamageNumber(),
              source_type: "Delivery Settlement",
              source_reference_id: settlementId,
              created_by: data.deliveryManName || "System",
              status: "Approved",
              // Pre-approved on settlement finalization
              damage_date: data.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              damage_reason: "Delivery Settlement Damage",
              qty: dmg,
              loss_amount: lossAmount,
              items: [
                {
                  product_id: detail.product_id,
                  product_name: detail.product_name,
                  batch_id: detail.batch_id.toString(),
                  qty: dmg,
                  purchase_price: detail.purchase_price,
                  loss_amount: lossAmount
                }
              ]
            });
            await damageRecord.save({ session });
            totalLoss = Number((totalLoss + lossAmount).toFixed(2));
          }
          if (sold > 0) {
            const sellingPrice = Number(item.sellingPrice) || detail.selling_price;
            const revenue = Number((sold * sellingPrice).toFixed(2));
            const cost = Number((sold * detail.purchase_price).toFixed(2));
            const profit = Number((revenue - cost).toFixed(2));
            const saleBatch = new SaleBatchDetailModel({
              sale_id: settlementId,
              batch_id: detail.batch_id,
              qty: sold,
              purchase_price: detail.purchase_price,
              selling_price: sellingPrice,
              revenue,
              cost,
              profit
            });
            await saleBatch.save({ session });
            totalSales = Number((totalSales + revenue).toFixed(2));
            totalCostOfSales = Number((totalCostOfSales + cost).toFixed(2));
          }
        }
        totalLoaded += loadedQty;
        totalSold += soldQty;
        totalReturned += returnedQty;
        totalDamaged += damagedQty;
        updatedItems.push({
          productId: item.productId,
          productName: item.productName,
          loadedQuantity: loadedQty,
          soldQuantity: soldQty,
          returnedQuantity: returnedQty,
          damagedQuantity: damagedQty,
          freeQuantity: freeQty,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice
        });
      }
      const grossProfit = Number((totalSales - totalCostOfSales).toFixed(2));
      const netProfit = Number((grossProfit - totalLoss).toFixed(2));
      const settlement = new SettlementModel({
        _id: settlementId,
        date: data.date ? new Date(data.date).toISOString().slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        deliveryManName: data.deliveryManName,
        deliveryManId: data.deliveryManId,
        route: data.route || loadingSheet.route,
        loadingSheetId: data.loadingSheetId,
        loadingSheetInvoiceNo: loadingSheet.invoice_no || `INV-${loadingSheet._id.toString().slice(-6).toUpperCase()}`,
        totalLoaded,
        totalSold,
        totalReturned,
        totalDamaged,
        totalSales,
        totalProfit: netProfit,
        totalLoss,
        status: "finalized",
        items: updatedItems
      });
      const savedSettlement = await settlement.save({ session });
      await SaleBatchDetailModel.updateMany(
        { sale_id: null },
        { $set: { sale_id: savedSettlement._id } }
      ).session(session || null);
      loadingSheet.status = "settled";
      loadingSheet.settlement_date = new Date(settlement.date);
      await loadingSheet.save({ session });
      return savedSettlement;
    });
  }
  async getAllSettlements(options, search_query, filters = {}) {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.$or = [
        { deliveryManName: { $regex: search_query, $options: "i" } },
        { route: { $regex: search_query, $options: "i" } }
      ];
    }
    if (filters.start_date && filters.end_date) {
      searchCondition.date = {
        $gte: filters.start_date,
        $lte: filters.end_date
      };
    } else if (filters.start_date) {
      searchCondition.date = { $gte: filters.start_date };
    } else if (filters.end_date) {
      searchCondition.date = { $lte: filters.end_date };
    }
    const result = await SettlementModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await SettlementModel.countDocuments(searchCondition);
    const summaryResult = await SettlementModel.aggregate([
      { $match: searchCondition },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSales" },
          totalProfit: { $sum: "$totalProfit" },
          totalLoss: { $sum: "$totalLoss" }
        }
      }
    ]);
    const summary = summaryResult[0] || {
      totalSales: 0,
      totalProfit: 0,
      totalLoss: 0
    };
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result,
      summary: {
        totalSales: summary.totalSales,
        totalProfit: summary.totalProfit,
        totalLoss: summary.totalLoss
      }
    };
  }
  async getSettlementById(id) {
    const settlement = await SettlementModel.findById(id);
    if (!settlement) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Settlement not found");
    }
    return settlement;
  }
};
var SettlementService = new Service16();

// src/modules/settlement/settlement.controller.ts
var Controller13 = class extends baseController_default {
  createSettlement = this.catchAsync(async (req, res) => {
    const data = await SettlementService.createSettlement(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Daily Settlement finalized and saved successfully",
      data
    });
  });
  getAllSettlements = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const data = await SettlementService.getAllSettlements(
      options,
      search_query,
      { start_date, end_date }
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily Settlements retrieved successfully",
      data
    });
  });
  getSettlementById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await SettlementService.getSettlementById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily Settlement retrieved successfully",
      data
    });
  });
};
var SettlementController = new Controller13();

// src/modules/settlement/settlement.validate.ts
var import_zod14 = require("zod");
var settlementItemValidationSchema = import_zod14.z.object({
  productId: import_zod14.z.string({ required_error: "Product ID is required" }),
  productName: import_zod14.z.string({ required_error: "Product name is required" }),
  loadedQuantity: import_zod14.z.number({ required_error: "Loaded quantity is required" }).int("Loaded quantity must be an integer"),
  soldQuantity: import_zod14.z.number({ required_error: "Sold quantity is required" }).int("Sold quantity must be an integer"),
  returnedQuantity: import_zod14.z.number({ required_error: "Returned quantity is required" }).int("Returned quantity must be an integer"),
  damagedQuantity: import_zod14.z.number({ required_error: "Damaged quantity is required" }).int("Damaged quantity must be an integer"),
  freeQuantity: import_zod14.z.number().int("Free quantity must be an integer").optional(),
  purchasePrice: import_zod14.z.number({ required_error: "Purchase price is required" }),
  sellingPrice: import_zod14.z.number({ required_error: "Selling price is required" })
});
var createSettlementValidationSchema = import_zod14.z.object({
  body: import_zod14.z.object({
    date: import_zod14.z.string({ required_error: "Date is required" }),
    deliveryManName: import_zod14.z.string({
      required_error: "Delivery representative name is required"
    }),
    deliveryManId: import_zod14.z.string({
      required_error: "Delivery representative ID is required"
    }),
    route: import_zod14.z.string().optional(),
    loadingSheetId: import_zod14.z.string({
      required_error: "Loading sheet ID is required"
    }),
    totalLoaded: import_zod14.z.number({ required_error: "Total loaded pieces quantity is required" }).int("Total loaded pieces must be an integer"),
    totalSold: import_zod14.z.number({ required_error: "Total sold pieces quantity is required" }).int("Total sold pieces must be an integer"),
    totalReturned: import_zod14.z.number({ required_error: "Total returned pieces quantity is required" }).int("Total returned pieces must be an integer"),
    totalDamaged: import_zod14.z.number({ required_error: "Total damaged pieces quantity is required" }).int("Total damaged pieces must be an integer"),
    totalSales: import_zod14.z.number({ required_error: "Total sales value is required" }),
    totalProfit: import_zod14.z.number({ required_error: "Total net profit is required" }),
    totalLoss: import_zod14.z.number({ required_error: "Total loss value is required" }),
    status: import_zod14.z.enum(["finalized"]).optional(),
    items: import_zod14.z.array(settlementItemValidationSchema, {
      required_error: "Items are required"
    })
  })
});
var settlementValidations = {
  create: createSettlementValidationSchema
};

// src/modules/settlement/settlement.routes.ts
var router14 = (0, import_express14.Router)();
router14.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(settlementValidations.create),
  SettlementController.createSettlement
);
router14.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  SettlementController.getAllSettlements
);
router14.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  SettlementController.getSettlementById
);
var SettlementRoutes = router14;

// src/modules/area/area.routes.ts
var import_express15 = require("express");

// src/modules/area/area.model.ts
var import_mongoose17 = require("mongoose");
var areaSchema = new import_mongoose17.Schema(
  {
    name: { type: String, required: true, unique: true },
    note: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    coverage_radius: {
      type: Number,
      required: true,
      default: 5
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    zoom: {
      type: Number,
      default: 12
    }
  },
  schemaOptions
);
var AreaModel = (0, import_mongoose17.model)("Area", areaSchema);

// src/modules/area/area.service.ts
var Service17 = class {
  async createArea(data) {
    const isExist = await AreaModel.findOne({ name: data.name });
    if (isExist) {
      throw new error_default(HttpStatusCode.CONFLICT, "Area already exists");
    }
    return await AreaModel.create(data);
  }
  async getAllAreas(options, search_query) {
    const {
      limit = 100,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const searchCondition = {};
    if (search_query) {
      searchCondition.name = { $regex: search_query, $options: "i" };
    }
    const result = await AreaModel.find({ ...searchCondition }).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await AreaModel.countDocuments(searchCondition);
    return {
      meta: { page, limit, total },
      data: result
    };
  }
  async getAreaById(id) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return area;
  }
  async updateArea(id, data) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return await AreaModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }
  async deleteArea(id) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new error_default(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return await AreaModel.findByIdAndDelete(id);
  }
};
var AreaService = new Service17();

// src/modules/area/area.controller.ts
var Controller14 = class extends baseController_default {
  createArea = this.catchAsync(async (req, res) => {
    const data = await AreaService.createArea(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Area created successfully",
      data
    });
  });
  getAllAreas = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const data = await AreaService.getAllAreas(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Areas retrieved successfully",
      data
    });
  });
  getAreaById = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await AreaService.getAreaById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area retrieved successfully",
      data
    });
  });
  updateArea = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = await AreaService.updateArea(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area updated successfully",
      data
    });
  });
  deleteArea = this.catchAsync(async (req, res) => {
    const id = req.params.id;
    await AreaService.deleteArea(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area deleted successfully",
      data: null
    });
  });
};
var AreaController = new Controller14();

// src/modules/area/area.validate.ts
var import_zod15 = require("zod");
var createAreaValidationSchema = import_zod15.z.object({
  body: import_zod15.z.object({
    name: import_zod15.z.string({ required_error: "Area name is required" }),
    note: import_zod15.z.string().optional(),
    status: import_zod15.z.enum(["Active", "Inactive"]).optional(),
    coverage_radius: import_zod15.z.number({
      required_error: "Coverage radius is required"
    }),
    latitude: import_zod15.z.number({ required_error: "Latitude is required" }),
    longitude: import_zod15.z.number({ required_error: "Longitude is required" }),
    zoom: import_zod15.z.number().optional()
  })
});
var updateAreaValidationSchema = import_zod15.z.object({
  body: import_zod15.z.object({
    name: import_zod15.z.string().optional(),
    note: import_zod15.z.string().optional(),
    status: import_zod15.z.enum(["Active", "Inactive"]).optional(),
    coverage_radius: import_zod15.z.number().optional(),
    latitude: import_zod15.z.number().optional(),
    longitude: import_zod15.z.number().optional(),
    zoom: import_zod15.z.number().optional()
  })
});
var areaValidations = {
  create: createAreaValidationSchema,
  update: updateAreaValidationSchema
};

// src/modules/area/area.routes.ts
var router15 = (0, import_express15.Router)();
router15.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(areaValidations.create),
  AreaController.createArea
);
router15.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.getAllAreas
);
router15.get(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.getAreaById
);
router15.patch(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest_default(areaValidations.update),
  AreaController.updateArea
);
router15.delete(
  "/:id",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.deleteArea
);
var AreaRoutes = router15;

// src/modules/damage-record/damage-record.routes.ts
var import_express16 = require("express");

// src/modules/damage-record/damage-record.service.ts
var import_mongoose18 = __toESM(require("mongoose"));
var Service18 = class {
  async createDamageRecord(data, operator) {
    return await runTransactionWithFallback(async (session) => {
      const items = data.items || [];
      if (items.length === 0) {
        throw new error_default(
          HttpStatusCode.BAD_REQUEST,
          "Damage record must contain at least one product item"
        );
      }
      let totalQty = 0;
      let totalLoss = 0;
      const processedItems = [];
      for (const item of items) {
        const product = await ProductModel.findById(item.productId).session(
          session || null
        );
        if (!product) {
          throw new error_default(
            HttpStatusCode.NOT_FOUND,
            `Product not found: ${item.productName}`
          );
        }
        const batch = product.batches.find(
          (b) => b.batch_id === item.batchId || b._id?.toString() === item.batchId
        );
        const qty = Number(item.qty) || 0;
        if (qty <= 0) {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            "Quantity must be greater than zero"
          );
        }
        const cartonPackets = product.carton_packets || 1;
        const purchasePrice = batch ? Number(batch.purchase_rate_carton) / cartonPackets : Number(item.purchasePrice || 0);
        const lossAmount = Number((qty * purchasePrice).toFixed(2));
        totalQty += qty;
        totalLoss = Number((totalLoss + lossAmount).toFixed(2));
        processedItems.push({
          product_id: product._id,
          product_name: product.name,
          batch_id: batch ? batch.batch_id || batch._id.toString() : item.batchId,
          qty,
          purchase_price: purchasePrice,
          loss_amount: lossAmount
        });
      }
      const status2 = data.source_type === "Delivery Settlement" ? "Approved" : "Pending";
      const damageRecord = new DamageRecordModel({
        damage_number: generateDamageNumber(),
        source_type: data.source_type,
        source_reference_id: data.source_reference_id ? new import_mongoose18.default.Types.ObjectId(data.source_reference_id) : void 0,
        created_by: operator || "System",
        status: status2,
        damage_date: data.damage_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        damage_reason: data.damage_reason,
        qty: totalQty,
        loss_amount: totalLoss,
        items: processedItems
      });
      const saved = await damageRecord.save({ session });
      return saved;
    });
  }
  async updateDamageStatus(id, status2, operator) {
    return await runTransactionWithFallback(async (session) => {
      const record = await DamageRecordModel.findById(id).session(
        session || null
      );
      if (!record) {
        throw new error_default(HttpStatusCode.NOT_FOUND, "Damage record not found");
      }
      if (status2 === "Approved") {
        if (record.status !== "Pending") {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `Cannot approve a record with status: ${record.status}`
          );
        }
        for (const item of record.items) {
          const product = await ProductModel.findById(item.product_id).session(
            session || null
          );
          if (!product) {
            throw new error_default(
              HttpStatusCode.NOT_FOUND,
              `Product not found: ${item.product_name}`
            );
          }
          const batch = product.batches.find(
            (b) => b.batch_id === item.batch_id || b._id?.toString() === item.batch_id
          );
          if (!batch) {
            throw new error_default(
              HttpStatusCode.NOT_FOUND,
              `Batch ${item.batch_id} not found for product ${product.name}`
            );
          }
          const currentAvailable = Number(batch.packs_added) || 0;
          if (currentAvailable < item.qty) {
            throw new error_default(
              HttpStatusCode.BAD_REQUEST,
              `Insufficient stock in batch ${batch.batch_id} for product ${product.name}. Available: ${currentAvailable}, Required: ${item.qty}`
            );
          }
          batch.packs_added = currentAvailable - item.qty;
          await product.save({ session });
        }
        record.status = "Approved";
        record.approved_by = operator;
      } else if (status2 === "Rejected") {
        if (record.status !== "Pending") {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `Cannot reject a record with status: ${record.status}`
          );
        }
        record.status = "Rejected";
        record.approved_by = operator;
      } else if (status2 === "Disposed") {
        if (record.status !== "Approved") {
          throw new error_default(
            HttpStatusCode.BAD_REQUEST,
            `Only Approved records can be Disposed. Current status: ${record.status}`
          );
        }
        record.status = "Disposed";
        record.approved_by = operator;
      } else {
        throw new error_default(
          HttpStatusCode.BAD_REQUEST,
          `Invalid status value: ${status2}`
        );
      }
      await record.save({ session });
      return record;
    });
  }
  async getAllDamageRecords(options, search_query, filters = {}) {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = paginationHelpers.calculatePagination(options);
    const condition = {};
    if (search_query) {
      condition.$or = [
        { damage_number: { $regex: search_query, $options: "i" } },
        { damage_reason: { $regex: search_query, $options: "i" } },
        { created_by: { $regex: search_query, $options: "i" } },
        { "items.product_name": { $regex: search_query, $options: "i" } }
      ];
    }
    if (filters.status) {
      condition.status = filters.status;
    }
    if (filters.source_type) {
      condition.source_type = filters.source_type;
    }
    if (filters.start_date && filters.end_date) {
      condition.damage_date = {
        $gte: filters.start_date,
        $lte: filters.end_date
      };
    } else if (filters.start_date) {
      condition.damage_date = { $gte: filters.start_date };
    } else if (filters.end_date) {
      condition.damage_date = { $lte: filters.end_date };
    }
    const result = await DamageRecordModel.find(condition).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit);
    const total = await DamageRecordModel.countDocuments(condition);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    };
  }
  async getDamageStockSummary(options, search_query) {
    const {
      limit = 20,
      page = 1,
      skip
    } = paginationHelpers.calculatePagination(options);
    const matchCondition = { status: "Approved" };
    const pipeline = [
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          company: "$productDetails.company_name",
          product: "$items.product_name",
          batch_id: "$items.batch_id",
          purchase_price: "$items.purchase_price",
          qty: "$items.qty",
          loss_amount: "$items.loss_amount"
        }
      },
      {
        $group: {
          _id: {
            product: "$product",
            batch_id: "$batch_id"
          },
          company: { $first: "$company" },
          purchase_price: { $first: "$purchase_price" },
          qty: { $sum: "$qty" },
          total_value: { $sum: "$loss_amount" }
        }
      },
      {
        $project: {
          _id: 0,
          company: 1,
          product: "$_id.product",
          batch_id: "$_id.batch_id",
          purchase_price: 1,
          qty: 1,
          total_value: 1
        }
      }
    ];
    if (search_query) {
      pipeline.push({
        $match: {
          $or: [
            { product: { $regex: search_query, $options: "i" } },
            { company: { $regex: search_query, $options: "i" } },
            { batch_id: { $regex: search_query, $options: "i" } }
          ]
        }
      });
    }
    const allAggregated = await DamageRecordModel.aggregate(pipeline);
    const total = allAggregated.length;
    pipeline.push({ $skip: skip }, { $limit: limit });
    const paginated = await DamageRecordModel.aggregate(pipeline);
    return {
      meta: {
        page,
        limit,
        total
      },
      data: paginated
    };
  }
  async getDamageReports(filters = {}) {
    const matchCondition = { status: { $in: ["Approved", "Disposed"] } };
    if (filters.start_date && filters.end_date) {
      matchCondition.damage_date = {
        $gte: filters.start_date,
        $lte: filters.end_date
      };
    }
    const totalSummary = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalLoss: { $sum: "$loss_amount" },
          totalQty: { $sum: "$qty" },
          totalRecords: { $sum: 1 }
        }
      }
    ]);
    const summary = totalSummary[0] || {
      totalLoss: 0,
      totalQty: 0,
      totalRecords: 0
    };
    const lossBySource = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$source_type",
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" }
        }
      },
      { $project: { source: "$_id", loss: 1, qty: 1, _id: 0 } }
    ]);
    const lossByMonth = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $substr: ["$damage_date", 0, 7] },
          // YYYY-MM
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", loss: 1, qty: 1, _id: 0 } }
    ]);
    const lossByProduct = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          loss: { $sum: "$items.loss_amount" },
          qty: { $sum: "$items.qty" }
        }
      },
      { $sort: { loss: -1 } },
      { $limit: 10 },
      { $project: { product: "$_id", loss: 1, qty: 1, _id: 0 } }
    ]);
    const lossByBatch = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.batch_id",
          loss: { $sum: "$items.loss_amount" },
          qty: { $sum: "$items.qty" }
        }
      },
      { $sort: { loss: -1 } },
      { $limit: 10 },
      { $project: { batch: "$_id", loss: 1, qty: 1, _id: 0 } }
    ]);
    const lossByDeliveryMan = await DamageRecordModel.aggregate([
      {
        $match: {
          ...matchCondition,
          source_type: "Delivery Settlement"
        }
      },
      {
        $group: {
          _id: "$created_by",
          // Contains the delivery man name
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" }
        }
      },
      { $sort: { loss: -1 } },
      { $project: { deliveryMan: "$_id", loss: 1, qty: 1, _id: 0 } }
    ]);
    const lossByWarehouse = await DamageRecordModel.aggregate([
      {
        $match: {
          ...matchCondition,
          source_type: "Warehouse"
        }
      },
      {
        $group: {
          _id: "$damage_reason",
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" }
        }
      },
      {
        $project: {
          reason: { $ifNull: ["$_id", "Unspecified Reason"] },
          loss: 1,
          qty: 1,
          _id: 0
        }
      }
    ]);
    return {
      summary,
      lossBySource,
      lossByMonth,
      lossByProduct,
      lossByBatch,
      lossByDeliveryMan,
      lossByWarehouse
    };
  }
};
var DamageRecordService = new Service18();

// src/modules/damage-record/damage-record.controller.ts
var Controller15 = class extends baseController_default {
  createDamageRecord = this.catchAsync(async (req, res) => {
    const operator = req.user?.name || "Admin";
    const data = await DamageRecordService.createDamageRecord(
      req.body,
      operator
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Damage record created successfully",
      data
    });
  });
  updateDamageStatus = this.catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status: status2 } = req.body;
    const operator = req.user?.name || "Admin";
    const data = await DamageRecordService.updateDamageStatus(
      id,
      status2,
      operator
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `Damage record status updated to ${status2} successfully`,
      data
    });
  });
  getAllDamageRecords = this.catchAsync(async (req, res) => {
    const options = pickQueries_default(req.query, paginationFields);
    const search_query = req.query.search_query;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const status2 = req.query.status;
    const source_type = req.query.source_type;
    const data = await DamageRecordService.getAllDamageRecords(
      options,
      search_query,
      {
        start_date,
        end_date,
        status: status2,
        source_type
      }
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Damage records retrieved successfully",
      data
    });
  });
  getDamageStockSummary = this.catchAsync(
    async (req, res) => {
      const options = pickQueries_default(req.query, paginationFields);
      const search_query = req.query.search_query;
      const data = await DamageRecordService.getDamageStockSummary(
        options,
        search_query
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Damage stock summary retrieved successfully",
        data
      });
    }
  );
  getDamageReports = this.catchAsync(async (req, res) => {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const data = await DamageRecordService.getDamageReports({
      start_date,
      end_date
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Damage reports generated successfully",
      data
    });
  });
};
var DamageRecordController = new Controller15();

// src/modules/damage-record/damage-record.routes.ts
var router16 = (0, import_express16.Router)();
router16.post(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.createDamageRecord
);
router16.get(
  "/",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getAllDamageRecords
);
router16.get(
  "/stock",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getDamageStockSummary
);
router16.get(
  "/reports",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getDamageReports
);
router16.patch(
  "/:id/status",
  verifyToken_default([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.updateDamageStatus
);
var DamageRecordRoutes = router16;

// src/routes/index.ts
var router17 = import_express17.default.Router();
var moduleRoutes = [
  {
    path: "/auth/admin",
    route: AuthAdminRoutes
  },
  {
    path: "/admin/users",
    route: UserAdminRoutes
  },
  {
    path: "/admin",
    route: AdminRoutes
  },
  {
    path: "/otp",
    route: OTPRoutes
  },
  {
    path: "/customer",
    route: CustomerRoutes
  },
  {
    path: "/forget-password",
    route: ForgetPasswordRoutes
  },
  {
    path: "/statistics",
    route: StatisticsRoutes
  },
  {
    path: "/categories",
    route: CategoryRoutes
  },
  {
    path: "/products",
    route: ProductRoutes
  },
  {
    path: "/units",
    route: UnitRoutes
  },
  {
    path: "/companies",
    route: CompanyRoutes
  },
  {
    path: "/delivery-men",
    route: DeliveryManRoutes
  },
  {
    path: "/loading-sheets",
    route: LoadingSheetRoutes
  },
  {
    path: "/settlements",
    route: SettlementRoutes
  },
  {
    path: "/areas",
    route: AreaRoutes
  },
  {
    path: "/damage-records",
    route: DamageRecordRoutes
  }
];
moduleRoutes.forEach((route) => router17.use(route.path, route.route));
var routes_default = router17;

// src/app.ts
var import_events = __toESM(require_events());

// src/middlewares/expressMiddlewares.ts
var import_express18 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_cors = __toESM(require("cors"));
var import_morgan = __toESM(require("morgan"));

// src/lib/trace.ts
var Service19 = class {
  generateAPIRequestTraceId() {
    return UUIDService.generateWithoutDash();
  }
};
var TraceService = new Service19();

// src/middlewares/trace.middleware.ts
var traceMiddleware = (req, res, next) => {
  req.traceId = TraceService.generateAPIRequestTraceId();
  next();
};

// src/middlewares/rate-limiter.ts
var import_http_status2 = __toESM(require("http-status"));
var rateLimiter = (options) => {
  const { windowInSeconds, maxRequests, keyPrefix = "rate-limit" } = options;
  return async (req, res, next) => {
    try {
      const identifier = req.ip;
      const key = `${keyPrefix}:${identifier}`;
      const requests = await pubClient.incr(key);
      if (requests === 1) {
        await pubClient.expire(key, windowInSeconds);
      }
      if (requests > maxRequests) {
        const ttl = await pubClient.ttl(key);
        return res.status(import_http_status2.default.TOO_MANY_REQUESTS).json({
          statusCode: import_http_status2.default.TOO_MANY_REQUESTS,
          success: false,
          message: "Too many requests. Please try again later.",
          retry_after_seconds: ttl
        });
      }
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};

// src/middlewares/logger.ts
init_eventEmitter();
init_config();
var loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    const input = req.method === "GET" ? req.query : req.body;
    const logData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      traceId: req.traceId,
      duration,
      ip: req.ip,
      method: req.method,
      input,
      output: body,
      fullUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`
    };
    console.log(logData);
    if (envConfig.app.env === "development") {
      emitter.emitAsync("apiLog", logData);
    }
    return originalSend.call(this, body);
  };
  next();
};

// src/config/corsOptions.ts
init_config();
var corsOptions = {
  origin: (origin, callback) => {
    console.log({ origin });
    if (!origin) return callback(null, true);
    console.log(envConfig.cors_origins);
    console.log({ isOriginIncludes: envConfig.cors_origins.includes(origin) });
    if (process.env.NODE_ENV === "development" || envConfig.cors_origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};

// src/utils/performanceLogger.ts
var logPerformance = (data) => {
  const sizeKB = data.contentLength ? (data.contentLength / 1024).toFixed(2) : "0";
  console.log(`
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4E1} API PERFORMANCE LOG
\u{1F552} ${data.timestamp}
\u27A1\uFE0F  ${data.method} ${data.url}
\u2705 Success: ${data.success}
\u{1F4E6} Status: ${data.statusCode}
\u23F1  Time: ${data.durationMs} ms
\u{1F4CF} Size: ${sizeKB} KB
\u{1F194} TraceId: ${data.traceId || "N/A"}
\u{1F4DD} Message: ${data.message || "\u2014"}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`);
};

// src/middlewares/performanceMiddleware.ts
var import_perf_hooks = require("perf_hooks");
var performanceLoggerMiddleware = (req, res, next) => {
  const start = import_perf_hooks.performance.now();
  res.on("finish", () => {
    const durationMs = +(import_perf_hooks.performance.now() - start).toFixed(2);
    logPerformance({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      success: res.statusCode < 400,
      durationMs,
      contentLength: Number(res.getHeader("content-length")) || 0,
      traceId: req.traceId || res.getHeader("x-railway-request-id")?.toString(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: "Request processed successfully"
    });
  });
  next();
};

// src/middlewares/expressMiddlewares.ts
var expressMiddlewares = (app2) => {
  const webhookPaths = ["/api/v1/payment/webhook"];
  app2.use((req, res, next) => {
    if (webhookPaths.includes(req.originalUrl)) {
      next();
    } else {
      import_express18.default.json({ limit: "100mb" })(req, res, next);
    }
  });
  app2.use(import_express18.default.urlencoded({ extended: true, limit: "100mb" }));
  app2.use((0, import_cors.default)(corsOptions));
  app2.use((0, import_cookie_parser.default)());
  app2.use((0, import_helmet.default)());
  app2.use((0, import_morgan.default)("dev"));
  app2.use(traceMiddleware);
  app2.use(loggerMiddleware);
  app2.use(performanceLoggerMiddleware);
  app2.use(
    rateLimiter({
      windowInSeconds: 600,
      maxRequests: 1e3
    })
  );
};
var notFoundRoutes = (app2) => {
  app2.use((req, res, next) => {
    console.log(`User hit: '${req.originalUrl}' is not exist`);
    res.status(HttpStatusCode.NOT_FOUND).json({
      statusCode: HttpStatusCode.NOT_FOUND,
      success: false,
      message: "API endpoint not found.",
      method: req.method,
      traceId: req.traceId || null,
      errorMessages: [
        {
          path: req.originalUrl,
          message: "The requested API endpoint does not exist."
        }
      ]
    });
    next();
  });
};

// src/config/mongoDbConnection.ts
var import_mongoose19 = __toESM(require("mongoose"));
init_config();
var import_dotenv2 = __toESM(require("dotenv"));
import_dotenv2.default.config();
var mongodbConnection = async () => {
  if (import_mongoose19.default.connection.readyState === 1) {
    console.log("\u2705 MongoDB already connected.");
    return;
  }
  console.log("\u23F3 Connecting MongoDB Database...");
  try {
    await import_mongoose19.default.connect(envConfig.database.mongodb_url, {
      retryWrites: true,
      serverSelectionTimeoutMS: 1e4
    });
    console.log("\u2705 MongoDB Connected Successfully!");
    try {
      const db = import_mongoose19.default.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: "products" }).toArray();
        if (collections.length > 0) {
          const indexes = await db.collection("products").indexes();
          const hasUniqueNameIndex = indexes.some(
            (index) => index.name === "name_1" && index.unique
          );
          if (hasUniqueNameIndex) {
            await db.collection("products").dropIndex("name_1");
            console.log(
              "\u{1F5D1}\uFE0F Dropped unique index 'name_1' on products collection."
            );
          }
        }
      }
    } catch (indexError) {
      console.warn(
        "\u26A0\uFE0F Warning: Could not check or drop unique name index on products collection:",
        indexError.message
      );
    }
  } catch (error) {
    console.error(`Failed to connect to MongoDB. Error: ${error?.message}`);
  }
};
var mongoDbConnection_default = mongodbConnection;

// src/middlewares/dbConnection.ts
var isConnected = false;
var dbConnectionMiddleware = async (req, res, next) => {
  try {
    if (!isConnected) {
      await mongoDbConnection_default();
      await connectRedis();
      isConnected = true;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app.ts
import_dotenv3.default.config();
var app = (0, import_express19.default)();
expressMiddlewares(app);
app.use(dbConnectionMiddleware);
app.get("/", async (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    traceId: req.traceId || null,
    message: "Distributor application is up and running",
    data: null
  });
});
app.use("/api/v1", routes_default);
app.use(globalErrorHandler_default.globalErrorHandler);
notFoundRoutes(app);
var app_default = app;

// src/entrypoint.ts
module.exports = app_default;
