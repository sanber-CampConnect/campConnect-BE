import dotenv from "dotenv";

import ERRORS from "../configs/error.js"

dotenv.config();
export default function errorHandler(err, req, res, next) {
    console.error(err)
    const {status_code, msg} = ERRORS[err.code] || {status_code: 500, msg: "Unknown server error"};
    return res.status(status_code).send({
        message: msg,
        log: (process.env.NODE_ENV == "DEVEL"? err.detail: undefined)
    })
}