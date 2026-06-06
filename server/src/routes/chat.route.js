import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chat.controller.js";

const router = express.Router();

// 1-on-1 Chat Routes
router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);

// Group Chat Routes
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupremove", protect, removeFromGroup);
router.put("/groupadd", protect, addToGroup);

export default router;