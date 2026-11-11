import express from "express";
import { chatController } from "#src/controllers/chat.controller.js";

const router = express.Router();

router.post("/website", chatController);

export default router;
