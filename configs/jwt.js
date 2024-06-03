import dotenv from "dotenv";
dotenv.config();

export default {
    secret: process.env.JWT_SECRET,
    lifetime: Number(process.env.JWT_LIFETIME)
}