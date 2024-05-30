import dotenv from "dotenv";
dotenv.config();

export default {
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
