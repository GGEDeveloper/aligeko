C:\Users\Pixie\OneDrive\Desktop\aligekow\.env

    # Ambiente
    NODE_ENV=production

    # Database config (Neon Postgres via Vercel)
    NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
    DB_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
    DB_PORT=5432
    DB_USER=neondb_owner
    DB_PASSWORD=npg_NEjIVhxi8JZ2
    DB_NAME=neondb
    DB_SSL=true
    LOG_LEVEL=info

    # Vercel Postgres parameters
    POSTGRES_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
    POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require
    POSTGRES_USER=neondb_owner
    POSTGRES_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
    POSTGRES_PASSWORD=npg_NEjIVhxi8JZ2
    POSTGRES_DATABASE=neondb

    # JWT Secret (usado para autenticação)
    JWT_SECRET=sua_chave_secreta_aqui
    JWT_EXPIRES_IN=24h

    # Configurações do servidor
    PORT=5000

    # Configurações de API
    API_VERSION=v1D



C:\Users\Pixie\OneDrive\Desktop\aligekow\.env.local

    # Created by Vercel CLI
    ADMIN_EMAIL="admin@alitools.com"
    API_URL="https://aligekow.vercel.app/api"
    BCRYPT_SALT_ROUNDS="12"
    CLIENT_URL="https://aligekow.vercel.app"
    DATABASE_URL="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    DB_HOST="ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech"
    DB_NAME="neondb"
    DB_PASSWORD="npg_NEjIVhxi8JZ2"
    DB_PORT="5432"
    DB_SSL="true"
    DB_USER="neondb_owner"
    EMAIL_FROM="no-reply@alitools.com"
    GEKO_API_KEY="your_geko_api_key"
    GEKO_API_URL="https://api.geko.com/v1"
    JWT_EXPIRATION="1h"
    JWT_REFRESH_EXPIRATION="7d"
    JWT_REFRESH_SECRET="alitools-secure-refresh-token-key-2024"
    JWT_SECRET="alitools-secure-jwt-secret-key-2024"
    LOG_FILE="logs/app.log"
    LOG_LEVEL="info"
    LOG_MAX_FILES="7d"
    LOG_MAX_SIZE="10m"
    NEON_DB_URL="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    NODE_ENV="production"
    PGDATABASE="neondb"
    PGHOST="ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech"
    PGHOST_UNPOOLED="ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech"
    PGPASSWORD="npg_NEjIVhxi8JZ2"
    PGUSER="neondb_owner"
    PORT="3000"
    POSTGRES_DATABASE="neondb"
    POSTGRES_HOST="ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech"
    POSTGRES_PASSWORD="npg_NEjIVhxi8JZ2"
    POSTGRES_PRISMA_URL="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
    POSTGRES_URL="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    POSTGRES_URL_NON_POOLING="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    POSTGRES_URL_NO_SSL="postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb"
    POSTGRES_USER="neondb_owner"
    RATE_LIMIT_MAX="100"
    RATE_LIMIT_WINDOW_MS="900000"
    SEED_DATA="true"
    SMTP_HOST="smtp.example.com"
    SMTP_PASS="your_password"
    SMTP_PORT="587"
    SMTP_USER="user@example.com"
    SYNC_HEALTH_ALERTS_ENABLED="true"
    SYNC_HEALTH_ALERT_THRESHOLD="3"
    SYNC_HEALTH_EMAIL_FROM="alerts@alitools.com"
    SYNC_HEALTH_EMAIL_TO="admin@alitools.com"
    TOTP_ISSUER="AliTools B2B"
    TOTP_SECRET_BYTES="20"
    TOTP_WINDOW="1"
    UPLOAD_ALLOWED_FORMATS="jpg,jpeg,png,gif"
    UPLOAD_MAX_SIZE="5"
    VERCEL_OIDC_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9hbGl0b29scy1wcm9qZWN0cyIsInN1YiI6Im93bmVyOmFsaXRvb2xzLXByb2plY3RzOnByb2plY3Q6YWxpZ2Vrb3c6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJzY29wZSI6Im93bmVyOmFsaXRvb2xzLXByb2plY3RzOnByb2plY3Q6YWxpZ2Vrb3c6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJhdWQiOiJodHRwczovL3ZlcmNlbC5jb20vYWxpdG9vbHMtcHJvamVjdHMiLCJvd25lciI6ImFsaXRvb2xzLXByb2plY3RzIiwib3duZXJfaWQiOiJ0ZWFtX1NHajR0VkFpeXV3cENHbVBrdGRGeEwySiIsInByb2plY3QiOiJhbGlnZWtvdyIsInByb2plY3RfaWQiOiJwcmpfc204UnpGN1dLMXdPdWhCZnhaWGJKUGRNRGhEbCIsImVudmlyb25tZW50IjoiZGV2ZWxvcG1lbnQiLCJuYmYiOjE3NDY1NTkzNDYsImlhdCI6MTc0NjU1OTM0NiwiZXhwIjoxNzQ2NjAyNTQ2fQ.EVgkkv_I4Cj4AsQbbSM37r4bOnyuMGBV3pKiddKDW8_-vh59ZnBfLUFtXHA8s-lIWxfGPRoP0JrfNCMc8FxDgtujQW_T5QOgzbLVuyVzDTW1krIxAbHCb0nttH6g02Rg8UyaVfdDVlQAGhLspMNe6OKfnhxmML8Z4alxX1sXyTPu33gkFHDfGFQJPZm-Us4UbGdAv87kFtT9yUSxYDwTLEw-vmstg1IHdE7Z1pHlUkpXmJ7-TJNtLp-aN4a4Oa06Kee_GXvHkadV0sONVgA_3wZ1RvDiB7aWw7WyboNhisAQOR_2_OS8AiFS03Jbf2mTix8g9OKo9Yam62tOmZB25g"

