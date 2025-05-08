# Vercel Neon Connect Postgres DB Config
## .env.local
    # Recommended for most uses
    DATABASE_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

    # For uses requiring a connection without pgbouncer
    DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require

    # Parameters for constructing your own connection string
    PGHOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
    PGHOST_UNPOOLED=ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech
    PGUSER=neondb_owner
    PGDATABASE=neondb
    PGPASSWORD=npg_NEjIVhxi8JZ2

    # Parameters for Vercel Postgres Templates
    POSTGRES_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
    POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require
    POSTGRES_USER=neondb_owner
    POSTGRES_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
    POSTGRES_PASSWORD=npg_NEjIVhxi8JZ2
    POSTGRES_DATABASE=neondb
    POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb
    POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require


## psql
    psql "postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"


## Neon serverless driver
    import { neon } from "@neondatabase/serverless";

    export async function getData() {
        const sql = neon(process.env.DATABASE_URL);
        const data = await sql`SELECT * FROM posts;`;
        return data;
    }


## node-postgres
    import { Pool } from 'pg';

    const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    });

    async function getData() {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('SELECT * FROM posts');
        return rows;
    } finally {
        client.release();
    }
    }

    export default async function Page() {
    const data = await getData();
    return (
        <div>
        {data.map((post, index) => (
            <div key={index}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            </div>
        ))}
        </div>
    );
    }


postgras.js
    import postgres from 'postgres';

    const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });


## Drizzle
    // src/db.ts
    import { drizzle } from "drizzle-orm/neon-http";
    import { neon } from "@neondatabase/serverless";
    import { config } from "dotenv";

    config({ path: ".env" }); // or .env.local

    const sql = neon(process.env.DATABASE_URL!);
    export const db = drizzle({ client: sql });


## Prisma
    // prisma/schema.prisma
    datasource db {
    provider  = "postgresql"
    url  	    = env("DATABASE_URL")
    }