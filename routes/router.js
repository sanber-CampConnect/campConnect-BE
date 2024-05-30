import express from "express";
import connection from "../models/DBConnection.js"

const ROUTER = express.Router();
ROUTER.use("/", async(req, res, next) => {
    await connection.testQuery()
        .then((result) => {
            return res.send({
                msg: "hello from CampConnect",
                data: result
            })
        })
        .catch((err) => { next({code: "sql_error", detail: err}) })
});

export default ROUTER;