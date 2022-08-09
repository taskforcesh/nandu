# List of ENV variables that can be customized in Nandu

- `NANDU_LOG_LEVEL` defaults to debug if NODE_ENV is not set to production.
- `NANDU_ROOT_USER` (defaults to root)
- `NANDU_ROOT_PASSWD` (defaults to root)
- `NANDU_PASSWORD_SALT_ROUNDS` (defaults 10)
- `NANDU_SEQUELIZE_URI` (default: sqlite:./storage/db/nandu.db)
- `NANDU_S3_BUCKET`
- `NANDU_LOCAL_STORAGE_DIR`


| variable | meaning | required? | default |
| --- | --- | --- | --- |
| NANDU_LOG_LEVEL | the API token you generated in Slack | y | - |
| NANDU_ROOT_USER | the ID of the Slack channel to post to (not its name!) | y | - |
| NANDU_ROOT_PASSWD | the shared secret set up for the hooks you'll be receiving | y | - |
| NANDU_PASSWORD_SALT_ROUNDS | the port number to listen on | n | 6666 |
| NANDU_SEQUELIZE_URI | the path to mount the hook on | n | `/incoming` |
| NANDU_S3_BUCKET | used in logging | n | `hooks-bot` |
| NANDU_LOCAL_STORAGE_DIR | post as the inferred bot user (bot needs to be in the channel!) | n | - |

