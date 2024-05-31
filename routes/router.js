import express from "express";

// CRUD (Direct access for admins only)
import userRouter from "./user.route.js";

// Frontend
import profileRouter from "./profile.route.js"

const ROUTER = express.Router();
ROUTER.use("/user", userRouter);
ROUTER.use("/profile", profileRouter);
ROUTER.use("/", (req, res, next) => {
    return res.send({
        msg: "hello from CampConnect",
    })
});

export default ROUTER;