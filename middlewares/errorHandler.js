import dotenv from "dotenv";
dotenv.config();

export default function errorHandler(err, req, res, next) {
    return res.status(500).send({
        message: "error happened",
        log: (process.env.NODE_ENV == "DEVEL"? err: "[DISCLOSED]")
    })
}