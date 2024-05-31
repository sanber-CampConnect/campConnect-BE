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

    if (!token) {
        return res.status(401).json({ code: "token_missing_or_invalid", message: "No token provided" });
    }

    jwt.verify(token, secret[process.env.NODE_ENV], (err, decodedData) => {
        if (err) {
            return res.status(403).json({ code: "token_invalid", message: "Invalid token" });
        }

        req.id = decodedData.id;
        req.role = decodedData.role;
        next();
    });
}
