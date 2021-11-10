export default {
  /**
   * Define a username that would act as root and have special priviledges.
   *
   */
  rootUser: process.env["NANDU_ROOT_USER"] || "root",

  /*
   * Comma separated list of usernames
   * that would act as admin users and have special priviledges,
   * like for example creating users in the system.
   *
   */
  admins: (process.env["NANDU_ADMIN_USERS"] || "")
    .split(",")
    .map((user) => user.trim()),

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
      bucket: process.env["NANDU_REGISTRY_BUCKET"] || "nandu-registry",
    },
  },

  /**
   * Location of the packages files when using the local storage.
   */
  local: {
    baseDir: `${__dirname}/storage/packages`,
  },
};
