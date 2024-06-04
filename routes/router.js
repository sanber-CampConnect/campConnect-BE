import express from "express";
import authJWT from "../middlewares/authJwt.js";

// CRUD (Direct access for admins only)
import userRouter from "./user.route.js";

// Frontend
import authRouter from "./auth.route.js"
import profileRouter from "./profile.route.js"

const ROUTER = express.Router();
const FRONTEND_MIDDLEWARES = [authJWT]
const ADMIN_MIDDLEWARES = [authJWT]

ROUTER.use("/auth", authRouter);
ROUTER.use("/profile", FRONTEND_MIDDLEWARES, profileRouter);
ROUTER.use("/users", ADMIN_MIDDLEWARES, userRouter);
ROUTER.use("/", (req, res) => res.send({msg: "hello from CampConnect"}));

export default ROUTER;