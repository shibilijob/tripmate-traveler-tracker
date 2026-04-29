import express from "express";
import { createRoom, createSOS, getMyRooms, getNotifications, getRoomDetails, getRoomSOS, handleInviteAction, joinRoom, markAllAsRead, removeMember, sendTripInvite, updateTripStatus, updateVisibility, viewRoom } from "../controllers/userControllers/roomControllers.js";
import protect from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userControllers/authController.js";
import getChatHistory from "../controllers/userControllers/messageController.js";

const router = express.Router()

router.post('/createRoom',protect,createRoom)
router.post('/joinRoom',protect,joinRoom)
router.get('/roomDetails/:roomCode',getRoomDetails)
router.get('/myRooms',protect,getMyRooms)
router.get('/viewRoom/:roomId',protect,viewRoom)
router.post('/sendInvite',protect,sendTripInvite)
router.post('/removeMember',protect,removeMember)
router.patch('/handleInvite', protect, handleInviteAction);
router.patch('/visibility/:roomId', protect, updateVisibility)
router.patch('/status/:roomId', protect, updateTripStatus)
router.get('/myProfile',protect,getProfile)
router.get('/notifications',protect,getNotifications)
router.patch('/notifications/markRead', protect, markAllAsRead);
router.patch('/updateProfile',protect,updateProfile)
router.get('/chatHistory/:roomId',getChatHistory)
router.post('/sos', protect, createSOS);
router.get('/sos/:roomId', protect, getRoomSOS);

export default router;