import express from "express";
import controller from "../controllers/categories.controller.js"
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";

// TODO: Protect using RBAC
const ROUTER = express.Router();
ROUTER.get("/", controller.index);
ROUTER.get("/:id", controller.findOne);
ROUTER.post("/", admin_only_middlewares, controller.store);
ROUTER.put("/:id", admin_only_middlewares, controller.edit);
ROUTER.delete("/:id",admin_only_middlewares, controller.destroy);

export default ROUTER;
