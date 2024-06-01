import express from "express";
import controller from "../controllers/auth.controller.js"
const ROUTER = express.Router();

ROUTER.post("/register", controller.register);
ROUTER.post("/login", controller.login);
ROUTER.get("/forgotPassword", controller.resetPassword);
ROUTER.get("/verifyAccount/:hash", controller.verifyAccount);

export default ROUTER;