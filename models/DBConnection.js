import mysql from 'mysql2/promise';
import dbConfig from "../configs/db.js";
import dotenv from "dotenv";
dotenv.config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
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
        } catch (err) {
            // Log and handle connection errors
            console.error('Error connecting to MySQL:', error);
            throw {code: "sql_error", detail: err}
        }
    },

    query: async function(sql, params) {
        try {
            const [rows, fields] =  await pool.query(sql, params);
            return rows
        } catch(err) { 
            throw {code: "sql_error", detail: err}
        }
    }
}