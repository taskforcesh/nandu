# ENV variables that can be customized in Nandu

| variable                   | meaning                                                                       | required? | default                        |
| -------------------------- | ----------------------------------------------------------------------------- | --------- | ------------------------------ |
| NANDU_LOG_LEVEL            | A (pino)[https://getpino.io/#/] log level                                     | n         | `debug`                        |
| NANDU_ROOT_USER            | The user name that will be considered root of the system                      | n         | `root`                         |
| NANDU_ROOT_PASSWD          | The initial password used for the root user                                   | n         | `root`                         |
| NANDU_ROOT_EMAIL           | An email to be used for the root user                                         | n         | -                              |
| NANDU_PASSWORD_SALT_ROUNDS | The number of salt rounds to be used for hashing passwords                    | n         | 5                              |
| NANDU_SEQUELIZE_URI        | A (sequelizejs)[https://sequelize.org/] compatible URI to a DB                | n         | `sqlite:./storage/db/nandu.db` |
| NANDU_S3_BUCKET            | A bucket to use for storing all packages in S3                                | n         | -                              |
| NANDU_LOCAL_STORAGE_DIR    | A local directory to use for storing packages                                 | n         | -                              |
| NANDU_EMAIL_USE_TRANSPORT  | A transport to use for sending notifications (only mailgun supported for now) | n         | `mailgun`                      |
| NANDU_MAILGUN_API_KEY      | The mailgun API KEY                                                           | y         | -                              |
| NANDU_MAILGUN_DOMAIN       | The mailgun domain                                                            | y         | -                              |
