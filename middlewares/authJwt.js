import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function authJWT(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ code: "token_missing_or_invalid", message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedData) => {
        if (err) {
            return res.status(403).json({ code: "token_invalid", message: "Invalid token" });
        }

        req.id = decodedData.id;
        req.role = decodedData.role;
        next();
    });
}
