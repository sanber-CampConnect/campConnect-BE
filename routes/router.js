import express from "express";
import user from "../controllers/user.controller.js"
import connection from "../models/DBConnection.js"

const ROUTER = express.Router();
ROUTER.use("/user", user.index)
ROUTER.use("/", (req, res, next) => {
    connection.query("SELECT SLEEP(4)")
        .then((result) => {
            return res.send({
                msg: "hello from CampConnect",
                data: result
            })
        })
        .catch((err) => { next({code: "sql_error", detail: err}) })
});

export default ROUTER;