import User from "../../models/User.js";
import TripRoom from "../../models/TripRoom.js";
import sendEmail from "../../utils/sendEmail.js";
import mongoose from 'mongoose';

const getAdminDashboardStats = async (req, res) => {
    try {
        const stats = await TripRoom.aggregate([
            {
                $facet: {
                    // Total Rooms
                    "totalRooms": [{ $count: "count" }],
                    
                    // 2. Group by schema's status field
                    "statusCounts": [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    
                    // Get 3 most recent rooms and join with Leader info
                    "recentRooms": [
                        { $sort: { createdAt: -1 } },
                        { $limit: 3 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "roomLeaderId",
                                foreignField: "_id",
                                as: "leaderInfo"
                            }
                        },
                        { $unwind: "$leaderInfo" },
                        {
                            $project: {
                                tripName: 1,
                                destination: 1,
                                roomCode: 1,
                                createdAt: 1,
                                memberCount: { $size: "$members" },
                                leaderName: "$leaderInfo.userName"
                            }
                        }
                    ]
                }
            }
        ]);

        //  Count all users who aren't admins
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // Safely extract the facet results
        const result = stats[0];
        const rawStatus = result.statusCounts || [];
        
        const getCount = (statusName) => {
            return rawStatus.find(s => s._id === statusName)?.count || 0;
        };

        res.status(200).json({
            totalUsers,
            totalRooms: result.totalRooms[0]?.count || 0,
            plannedTrips: getCount("planned"),
            activeTrips: getCount("active"),
            completedTrips: getCount("completed"),
            recentRooms: result.recentRooms || []
        });

    } catch (error) {
        console.error("Dashboard Aggregation Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Error in getAllUsers:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllRooms = async (req, res) => {
    try {
        const rooms = await TripRoom.find({})
            .populate("roomLeaderId", "userName email") 
            .sort({ createdAt: -1 });

        // Return the data with a count for the dashboard stats
        res.status(200).json({
            success: true,
            totalRooms: rooms.length,
            rooms
        });

    } catch (error) {
        console.error("Error in getAllRooms:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Action denied. Cannot delete admin accounts." });
        }

        // to remove cast error
        const userObjectId = new mongoose.Types.ObjectId(id);

        // 1. block the room where user is leader
        await TripRoom.updateMany(
            { roomLeaderId: id }, 
            { $set: { roomStatus: 'blocked' } }
        );

        // 2. delete user from every rooms
        await TripRoom.updateMany(
            { members: userObjectId }, 
            { $pull: { members: userObjectId } } 
        );

        // SEND THE EMAIL
        const htmlMessage = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
                
                <tr>
                    <td align="center" style="padding: 30px 0; background: linear-gradient(135deg, #11889c 0%, #7ed3e2 100%);">
                    <h1 style="color: #ffffff; margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase; font-size: 24px;">TripMate</h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444444;">
                    <h2 style="color: #333333; margin-top: 0; font-size: 20px; font-weight: 600;">Account Notification</h2>
                    <p style="font-size: 16px;">Hi <strong>${user.userName}</strong>,</p>
                    <p style="font-size: 16px;">We are writing to inform you that your account on <strong>TripMate</strong> has been deactivated and removed by the administrator.</p>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #fff5f5; border-radius: 8px; border-left: 5px solid #ff4757; margin: 25px 0;">
                        <tr>
                        <td>
                            <p style="margin: 0; color: #555; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Reason for action:</p>
                            <p style="margin: 5px 0 0 0; color: #d73e22; font-size: 16px;">${reason || "Violation of community guidelines."}</p>
                        </td>
                        </tr>
                    </table>

                    <p style="font-size: 15px; color: #666;">If you believe this action was taken in error, our support team is here to help.</p>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 0 40px 40px 40px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                        <td align="center" bgcolor="#11889c" style="border-radius: 6px;">
                            <a href="mailto:support@tripmate.com" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 14px 30px; display: inline-block; font-weight: 600;">
                            Contact Support Team
                            </a>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 25px; background-color: #fcfcfc; border-top: 1px solid #f0f0f0; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
                    <p style="margin: 0; font-weight: bold; color: #11889c;">© 2026 TripMate | Adventure Awaits</p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        `;
        await sendEmail({
        email: user.email,
        subject: "Account Status Update - TripMate",
        message: `Your account was deleted. Reason: ${reason}`, // Plain text backup
        html: htmlMessage, // Modern HTML content
        });

        await User.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: "User deleted and their managed rooms have been blocked." 
        });

    } catch (error) {
        console.error("Delete User Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const toggleUserBlockStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const {reason} = req.body;

        // 1. Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Prevent blocking Admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Administrators cannot be blocked" });
        }

        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        const newRoomStatus = newStatus === 'blocked' ? 'deactivated' : 'active';

        const statusTitle = newStatus === 'blocked' ? "Account Deactivated" : "Account Reactivated";
        const statusAction = newStatus === 'blocked' ? "temporarily deactivated" : "successfully reactivated";
        const statusColor = newStatus === 'blocked' ? "#ff4757" : "#2ed573"; 

        // 4. Update User status
        user.status = newStatus;
        await user.save();

        // 5. Update all rooms where this user is the Leader
        // This ensures a blocked leader cannot have an active room
        await TripRoom.updateMany(
            { roomLeaderId: id },
            { $set: { roomStatus: newRoomStatus } }
        );

        // SEND THE EMAIL
        const htmlMessage = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
                
                <tr>
                    <td align="center" style="padding: 30px 0; background: linear-gradient(135deg, #11889c 0%, #7ed3e2 100%);">
                    <h1 style="color: #ffffff; margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase; font-size: 24px;">TripMate</h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444444;">
                    <h2 style="color: #333333; margin-top: 0; font-size: 20px; font-weight: 600;">${statusTitle}</h2>
                    <p style="font-size: 16px;">Hi <strong>${user.userName}</strong>,</p>
                    <p style="font-size: 16px;">This is to inform you that your account on <strong>TripMate</strong> has been <strong>${statusAction}</strong> by the administrator.</p>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f9f9f9; border-radius: 8px; border-left: 5px solid ${statusColor}; margin: 25px 0;">
                        <tr>
                        <td>
                            <p style="margin: 0; color: #555; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Current Status:</p>
                            <p style="margin: 5px 0 0 0; color: ${statusColor}; font-size: 18px; font-weight: bold;">${newStatus.toUpperCase()}</p>
                            ${newStatus === 'blocked' ? `
                            <p style="margin: 15px 0 0 0; color: #555; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
                                <strong>Reason for Deactivation:</strong> ${reason || "Violation of community guidelines."}
                            </p>
                            ` : `
                            <p style="margin: 15px 0 0 0; color: #2ed573; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
                                <strong>Note:</strong> Your account has been reviewed and reactivated.
                            </p>
                            `}
                        </td>
                        </tr>
                    </table>

                    <p style="font-size: 15px; color: #666;">
                        ${newStatus === 'blocked' 
                        ? "If you have any questions regarding this action, please contact our support team." 
                        : "You can now log in and continue your journey with TripMate."}
                    </p>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 0 40px 40px 40px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                        <td align="center" bgcolor="#11889c" style="border-radius: 6px;">
                            <a href="${newStatus === 'blocked' ? 'mailto:support@tripmate.com' : 'https://tripmate.com/login'}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 14px 30px; display: inline-block; font-weight: 600;">
                            ${newStatus === 'blocked' ? 'Contact Support' : 'Login to Account'}
                            </a>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 25px; background-color: #fcfcfc; border-top: 1px solid #f0f0f0; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
                    <p style="margin: 0; font-weight: bold; color: #11889c;">© 2026 TripMate | Adventure Awaits</p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        `;

        await sendEmail({
        email: user.email,
        subject: "Account Status Update - TripMate",
        message: `Your TripMate account is now ${newStatus}.`,
        html:htmlMessage,

        });

        res.status(200).json({
            success: true,
            message: `User account and their managed rooms are now ${newStatus}`,
            userStatus: newStatus
        });

    } catch (error) {
        console.error("Toggle Block Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const kickMemberFromRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        // 1. Find the room
        const room = await TripRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // 2. Prevent kicking the Room Leader (The owner)
        if (room.roomLeaderId.toString() === userId) {
            return res.status(403).json({ 
                message: "Cannot kick the Room Leader. Delete the entire room instead." 
            });
        }

        // 3. Remove the user from the members array
        // We use $pull to find the object where userId matches
        const updatedRoom = await TripRoom.findByIdAndUpdate(
            roomId,
            { $pull: { members: { userId: userId } } },
            { new: true }
        );

        res.status(200).json({ 
            success: true, 
            message: "User removed from the squad successfully",
            updatedRoom 
        });

    } catch (error) {
        console.error("Kick Member Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteEntireRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // 1. Check if the room exists
        const room = await TripRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found or already deleted" });
        }

        // 2. Perform the deletion
        await TripRoom.findByIdAndDelete(roomId);

        // 3. Return success
        res.status(200).json({ 
            success: true, 
            message: "Trip room has been permanently destroyed" 
        });

    } catch (error) {
        console.error("Delete Room Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export {getAdminDashboardStats, getAllUsers, getAllRooms, deleteUser, 
    toggleUserBlockStatus, kickMemberFromRoom, deleteEntireRoom
}