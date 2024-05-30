import express from "express";

const ROUTER = express.Router();
ROUTER.use("/", (req, res, next) => {
    res.send({ msg: "Hello from campConnect" })
});

export default ROUTER;