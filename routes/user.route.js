import express from "express";
import controller from "../controllers/user.controller.js"
import { admin_only_middlewares } from "../configs/accessMiddlewares.js";

// TODO: Protect using RBAC
const ROUTER = express.Router();
ROUTER.get("/", admin_only_middlewares, controller.index);
ROUTER.post("/", admin_only_middlewares, controller.store);
ROUTER.get("/:id", admin_only_middlewares, controller.findOne);
ROUTER.put("/:id", admin_only_middlewares, controller.edit);
ROUTER.delete("/:id", admin_only_middlewares, controller.destroy);

export default ROUTER;
