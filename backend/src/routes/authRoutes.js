import express from "express";
import { forgotPassword, googleLogin, loginUser, logoutUser, 
    refreshAccessToken, resetPassword, signupUser, verifyOTP 
} from "../controllers/userControllers/authController.js";

const router = express.Router()
router.post('/signup',signupUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.post('/forgot_password',forgotPassword)
router.post('/verify_otp',verifyOTP)
router.post('/reset_password',resetPassword)
router.get('/refresh', refreshAccessToken);
router.post('/google-login', googleLogin);

export default router