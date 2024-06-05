import express from "express";
import controller from "../controllers/categories.controller.js"

// TODO: Protect using RBAC
const ROUTER = express.Router();
ROUTER.get("/", controller.index);
ROUTER.post("/", controller.store);
ROUTER.get("/:id", controller.findOne);
ROUTER.put("/:id", controller.edit);
ROUTER.delete("/:id", controller.destroy);

export default ROUTER;
