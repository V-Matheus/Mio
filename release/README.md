# Production release

This directory contains the production deployment manifests and orchestration.
The VM receives these files from the manual GitHub Actions deploy workflow; it
does not clone the application repository.

```text
release/
├── environments/production/
│   ├── docker-compose.yml          # Main stack, includes the API and web Compose files
│   ├── docker-compose.migrate.yml  # One-shot migration job on the Mio Docker network
│   ├── nginx/                      # Host Nginx site configs (HTTP bootstrap and TLS)
│   └── environment/                # Documentation only; secrets stay under apps/*
├── scripts/
│   ├── lib.sh
│   └── release.sh                  # pull → databases → migrate → application update
└── .state/                         # VM-only production image tag and registry namespace
```

The root `docker-compose.yml` is also copied to the VM for familiar `docker compose`
inspection commands; release automation always uses the production manifest above.

The Nginx files are host configuration, not a replacement for `/etc/nginx/nginx.conf`.
Install `nginx/mio-http.conf` while issuing the certificate, then switch to
`nginx/mio.conf` for HTTPS. Only one of these site configs should be enabled at a time.

The production secrets remain at `/opt/mio/apps/api/.env` and
`/opt/mio/apps/web/.env`. The release workflow transfers Compose and shell
manifests, then pulls immutable GHCR image tags. `release/.state/production.state`
is written only after a successful release and is ignored by Git.
