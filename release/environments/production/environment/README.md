# Production environment files

Runtime secrets stay in the existing VM files `/opt/mio/apps/api/.env` and
`/opt/mio/apps/web/.env`. They are intentionally not copied into this release
directory or committed. `docker-compose.migrate.yml` reads the API environment
file because migrations use the same database connection settings as the API.
