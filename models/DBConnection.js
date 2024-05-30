import mysql from 'mysql2/promise';
import config from "../configs/db.js";
import dotenv from "dotenv";
dotenv.config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: config[process.env.NODE_ENV].host,
  user: config[process.env.NODE_ENV].user,
  database: config[process.env.NODE_ENV].database,
  password: config[process.env.NODE_ENV].password,
  port: config[process.env.NODE_ENV].port,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default {
    checkConnection: async function() {
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
    },

    testQuery: async function() {
        try {
            const [rows, fields] =  await pool.query('SELECT * FROM `test`');
            return rows;
        } catch(err) {
            throw(err)
        }
    },

    query: async function(query) {
        try {
            const [rows, fields] =  await pool.query(query);
            return rows;
        } catch(err) { throw(err) }
    }
}