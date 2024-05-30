import express from "express";
import connection from "../models/DBConnection.js"

const ROUTER = express.Router();
ROUTER.use("/", async(req, res, next) => {
    return res.send({
        msg: "hello from CampConnect",
        data: await connection.testQuery()
    })
});

export default ROUTER;