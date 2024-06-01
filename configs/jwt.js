import dotenv from "dotenv";
dotenv.config();

export default {
    "DEVEL": {
        secret: process.env.DEVEL_JWT_SECRET,
        lifetime: Number(process.env.DEVEL_JWT_LIFETIME)
    },
    "STAGING": {
        secret: process.env.STAGING_JWT_SECRET,
        lifetime: Number(process.env.STAGING_JWT_LIFETIME)
    },
    "PRODUCTION": {
        secret: process.env.PRODUCTION_JWT_SECRET,
        lifetime: Number(process.env.PRODUCTION_JWT_LIFETIME)
    }
}