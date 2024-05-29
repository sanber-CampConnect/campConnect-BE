// hello.js
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
dotenv.config();

const credentials = {
    "DEVEL": {
        host: process.env.DEVEL_DB_HOST,
        user: process.env.DEVEL_DB_USER,
        database: process.env.DEVEL_DB_NAME,
        password: process.env.DEVEL_DB_PASS,
        port: process.env.DEVEL_DB_PORT,
        secret: process.env.DEVEL_JWT_SECRET
    },
    "STAGING": {
        host: process.env.STAGING_DB_HOST,
        user: process.env.STAGING_DB_USER,
        database: process.env.STAGING_DB_NAME,
        password: process.env.STAGING_DB_PASS,
        port: process.env.STAGING_DB_PORT,
        secret: process.env.STAGING_JWT_SECRET
    },
    "PRODUCTION": {
        host: process.env.PRODUCTION_DB_HOST,
        user: process.env.PRODUCTION_DB_USER,
        database: process.env.PRODUCTION_DB_NAME,
        password: process.env.PRODUCTION_DB_PASS,
        port: process.env.PRODUCTION_DB_PORT,
        secret: process.env.PRODUCTION_JWT_SECRET
    }
}

console.log(process.env.NODE_ENV)
console.log(credentials[process.env.NODE_ENV])
console.log(credentials[process.env.NODE_ENV].host)

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: credentials[process.env.NODE_ENV].host,
  user: credentials[process.env.NODE_ENV].user,
  database: credentials[process.env.NODE_ENV].database,
  password: credentials[process.env.NODE_ENV].password,
  port: credentials[process.env.NODE_ENV].port,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function checkDatabaseConnection() {
  try {
    // Get a connection from the pool.
    const connection = await pool.getConnection();

    // If connection is successful, log the success message
    console.log('Connected to MySQL database successfully');

    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    // Log and handle connection errors
    console.error('Error connecting to MySQL:', error);
  }
}

async function query() {
    const [rows, fields] = await pool.query('SELECT * FROM `test`');
    console.log(rows)
}

// hello.js
checkDatabaseConnection()
query()