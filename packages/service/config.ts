export default {
  /**
   * Log level
   */
  logLevel:
    process.env["NANDU_LOG_LEVEL"] || process.env["NODE_ENV"] !== "production"
      ? "debug"
      : "info",

  /**
   * When Nandu registry starts it will create a root user if none exists already.
   * Otherwise these variables will be ignored.
   */
  root: {
    /**
     * Define a username that would act as root and have special priviledges.
     *
     */
    user: process.env["NANDU_ROOT_USER"] || "root",

    /**
     * Define a password that would act as root and have special priviledges.
     *
     */
    password: process.env["NANDU_ROOT_PASSWD"] || "root",


    /**
     * Define an email to be used for the root user.
     * 
     */
    email: process.env["NANDU_ROOT_EMAIL"],
  },

  /**
   * The number of saltrounds for user's passwords. Note, changing this value
   * on an existing database will make all users unable to login.
   */
  saltRounds: process.env["NANDU_PASSWORD_SALT_ROUNDS"] || 5,

  /**
   * A sequalize URI to determine which database to use.
   */
  sequelize: {
    uri: process.env["NANDU_SEQUELIZE_URI"] || "sqlite:./storage/db/nandu.db",
  },

  /**
   * A bucket name for the S3 storage. Note this must be a global unique name.
   */
  aws: {
    s3: {
      bucket: process.env["NANDU_S3_BUCKET"],
    },
  },

  /**
   * Location of the packages files when using the local storage.
   */
  local: {
    baseDir:
      process.env["NANDU_LOCAL_STORAGE_DIR"] || `${__dirname}/storage/packages`,
  },

  /**
   * Max package size, default 100Mb
   *
   */
  storage: {
    maxPackageSize: process.env["NANDU_MAX_PACKAGE_SIZE"] || "100mb",
  },

  /**
   * JWT settings
   */
  jwt: {
    secret: process.env["NANDU_JWT_SECRET"] || "nandu-secret",
  },

  /**
   * Dashboard url
   */
  dashboardUrl: process.env["NANDU_DASHBOARD_URL"] || "http://localhost:5173",

  /**
   * Email settings
   *
   */
  email: {
    from: process.env["NANDU_EMAIL_FROM"] || "admin@nandu.land",
    useTransport: process.env["NANDU_EMAIL_USE_TRANSPORT"],
    transports: {
      smtp: {
        host: process.env["NANDU_EMAIL_SMTP_HOST"] || "smtp.mailtrap.io",
        port:
          (process.env["NANDU_EMAIL_SMTP_PORT"] &&
            parseInt(process.env["NANDU_EMAIL_SMTP_PORT"])) ||
          2525,
        auth: {
          user: process.env["NANDU_EMAIL_SMTP_USER"],
          pass: process.env["NANDU_EMAIL_SMTP_PASS"],
        },
      },
      mailgun: {
        apiKey: process.env["NANDU_MAILGUN_API_KEY"],
        domain: process.env["NANDU_MAILGUN_DOMAIN"],
      },
    },
  },
};
