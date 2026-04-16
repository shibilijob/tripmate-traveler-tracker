import express from "express"
import protect from "../middlewares/authMiddleware.js"
import isAdmin from "../middlewares/adminAuthMIddleware.js"
import { 
    deleteEntireRoom, deleteUser, getAdminDashboardStats, getAllRooms, 
    getAllUsers, kickMemberFromRoom, toggleUserBlockStatus 
} from "../controllers/adminControllers/adminControllers.js"


const router = express.Router()

router.get('/dashboard',protect,isAdmin,getAdminDashboardStats)
router.get('/allUsers',protect,isAdmin,getAllUsers)
router.get('/allRooms',protect,isAdmin,getAllRooms)
router.delete('/deleteUser/:id',protect,isAdmin,deleteUser)
router.patch('/blockAndUnblock/:id',protect,isAdmin,toggleUserBlockStatus)
router.delete('/room/:roomId/kick/:userId', protect, isAdmin, kickMemberFromRoom)
router.delete('/deleteRoom/:roomId', protect, isAdmin, deleteEntireRoom);

export default router;