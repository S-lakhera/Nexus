import express from "express";
import authRoutes from "./auth.route.js";
import chatRoutes from "./chat.route.js"; 
import messageRoutes from "./message.route.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/chat", chatRoutes);
router.use("/message", messageRoutes);

export default router;