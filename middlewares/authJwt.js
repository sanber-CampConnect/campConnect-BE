import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = {
    "DEVEL": process.env.DEVEL_JWT_SECRET,
    "STAGING": process.env.STAGING_JWT_SECRET,
    "PRODUCTION": process.env.PRODUCTION_JWT_SECRET,
}

export default function authJWT(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return next({code: "no_token", msg: "No token provided"})

    jwt.verify(token, secret[process.env.NODE_ENV], (err, decodedData) => {
        if (err) return next({code: "invalid_token", msg: "Token may be invalid or expired. Try to login again"})

        req.id = decodedData.id;
        req.role = decodedData.role;
        next();
    });
}
