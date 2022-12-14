import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const databaseConfig = { 
  connectionString: process.env.DATABASE_URL,
  ssl: null
};

if (process.env.MODE === 'PROD') {
  databaseConfig.ssl = {
    rejectUnauthorized: false
  }
}

export const connection = new Pool(databaseConfig);

