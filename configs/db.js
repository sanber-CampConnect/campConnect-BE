import dotenv from "dotenv";
dotenv.config();

export default {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    secret: process.env.JWT_SECRET
}
