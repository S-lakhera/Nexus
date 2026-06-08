import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { allMessages, markMessageAsRead, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/:chatId", protect, allMessages)

router.post("/", protect, sendMessage)

router.post("/read", protect, markMessageAsRead)

export default router;