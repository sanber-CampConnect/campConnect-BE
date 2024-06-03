import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import jwtConfig from "../configs/jwt.js"
dotenv.config();

export default function authJWT(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return next({code: "no_token", msg: "No token provided"})

    jwt.verify(token, jwtConfig.secret, (err, decodedData) => {
        if (err) return next({code: "invalid_token", msg: "Token may be invalid or expired. Try to login again"})

        req.id = decodedData.id;
        req.role = decodedData.role;
        next();
    });
}
