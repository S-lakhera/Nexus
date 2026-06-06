import express from 'express'
import { allUsers, loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout",logoutUser)
router.post("/refresh", refreshToken)

router.get("/search", protect, allUsers)

export default router