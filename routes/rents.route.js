import express from "express";
import controller from "../controllers/rents.controller.js";
import { admin_only_middlewares, authenticated_only_middlewares } from "../configs/accessMiddlewares.js";

const ROUTER = express.Router();

ROUTER.get("/", authenticated_only_middlewares, controller.index);
ROUTER.get("/:id", authenticated_only_middlewares, controller.findOne);
ROUTER.get("/orderItem/:orderItemId", authenticated_only_middlewares, controller.findByOrderItemId);
ROUTER.post("/", authenticated_only_middlewares, controller.store);
ROUTER.put("/:id", authenticated_only_middlewares, controller.edit);
ROUTER.delete("/:id", authenticated_only_middlewares, controller.destroy);
ROUTER.patch("/:id", admin_only_middlewares, controller.finishRent)

export default ROUTER;
