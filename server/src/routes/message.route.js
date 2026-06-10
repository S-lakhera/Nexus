import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { allMessages, markMessagesAsRead, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/:chatId", protect, allMessages)

router.post("/", protect, sendMessage)

router.put("/read", protect, markMessagesAsRead)

export default router;