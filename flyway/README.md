# Flyway
This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `args`

**Required** The flyway command to execute.

## Environment Variables
This action supports all the environment variables that Flyway supports. See [here](https://flywaydb.org/documentation/envvars)
for more details.

## Example usage

uses: sittercity/github-actions/flyway@v1-6.4.3-alpine
with:
  args: migrate
env:
  FLYWAY_CONFIG_FILES: db/migrations/flyway.local.conf
  FLYWAY_LOCATIONS: filesystem:db/migrations/rollforward
  FLYWAY_PASSWORD: foo_pass
  FLYWAY_SQL_MIGRATION_PREFIX: v
  FLYWAY_URL: jdbc:postgresql://localhost:5432/foo_table
  FLYWAY_USER: foo_user