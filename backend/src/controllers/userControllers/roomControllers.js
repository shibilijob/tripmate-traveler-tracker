import Location from "../../models/Location.js";
import TripRoom from "../../models/TripRoom.js";
import User from "../../models/User.js";
import { customAlphabet } from 'nanoid';
import nodemailer from 'nodemailer'

// Define a custom alphabet: Uppercase letters and numbers (removing confusing ones like O, 0, I, 1)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

const createRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const { tripName, destination } = req.body;

        if (!tripName) {
            return res.status(400).json({ message: 'Trip name is required' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // --- GENERATE UNIQUE NANO ID ---
        const generatedRoomCode = nanoid();

        const room = await TripRoom.create({
            tripName,
            destination,
            roomLeaderId: userId,
            roomCode: generatedRoomCode,
            createdBy: userId,
            status: 'planned',
            members: [{
                userId: userId,
                userName: user.userName,
                role: 'roomLeader'
            }]
        });

        // create document for store location
        const location = await Location.create({
            tripRoomId: room._id,
            tripName: room.tripName,
            membersLocations: room.members.map(m => ({
                userId: m.userId,
                initialLocation: { lat: null, lng: null },
                lastLocation: { lat: null, lng: null }
            }))
        });

        res.status(201).json({
            message: "Trip room created successfully",
            room,
            location

        });

    } catch (error) {
        // If a collision happens MongoDB's unique index catches it
        if (error.code === 11000) {
            return res.status(400).json({ error: "Room code generated was not unique. Please try again." });
        }
        res.status(500).json({ error: error.message });
    }
}


const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;

    if (!roomCode) {
        return res.status(400).json({ message: "Room code is required" });
    }

    const room = await TripRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ message: "Room not found" });


    if (room.status === 'completed') {
            return res.status(400).json({ message: "This trip has already ended." });
        }

    // Check if user is already in the room
    const isAlreadyMember = room.members.some(
        (member) => member.userId.toString() === userId.toString()
    );

    if (isAlreadyMember) {
        return res.status(400).json({ 
            message: "You are already a member of this room", 
            room 
        });
    }

    if(room.members.length == 5){
        return res.status(403).json({message:'This room has reached its limit of 5 members.'})
    }

    // 2. Check if already invited/pending
    const alreadyInvited = room.invites.some(i => i.userId.toString() === userId.toString() && i.status === 'pending');
    if (alreadyInvited) return res.status(400).json({ message: "Request already pending" });

    // Add to INVITES array
    room.invites.push({
      userId: userId,
      userName: req.user.userName,
      email: req.user.email
    });

    await room.save();
    res.status(200).json({ success: true, message: "Request sent to leader!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const handleInviteAction = async (req, res) => {
    try {
        const { roomId, targetUserId, action } = req.body; // action: 'accept' or 'reject'
        const leaderId = req.user._id;

        // 1. Find the room
        const room = await TripRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // 2. Security: Only the Room Leader can accept/reject invites
        if (room.roomLeaderId.toString() !== leaderId.toString()) {
            return res.status(403).json({ message: "Only the Room Leader can manage invites" });
        }

        // 3. Find the specific invite in the array
        const inviteIndex = room.invites.findIndex(i => i.userId.toString() === targetUserId);
        if (inviteIndex === -1) {
            return res.status(404).json({ message: "Invite request no longer exists" });
        }

        const requester = room.invites[inviteIndex];

        if (action === 'accept') {
            // Check room capacity again just in case
            if (room.members.length >= 5) {
                return res.status(400).json({ message: "Room is already full (Max 5 members)" });
            }

            // Move to members array
            room.members.push({
                userId: requester.userId,
                userName: requester.userName,
                role: 'member'
            });

            // mark as accepted
            room.invites[inviteIndex].status = 'accepted';
            
            await room.save();

            // 2. Location കളക്ഷനിൽ ഈ പുതിയ മെമ്പറെ കൂടി ചേർക്കുന്നു
            await Location.findOneAndUpdate({ tripRoomId: roomId },
                { 
                    $push: { 
                        membersLocations: {
                            userId: requester.userId,
                            initialLocation: { lat: null, lng: null },
                            lastLocation: { lat: null, lng: null }
                        }
                    }
                }
            );


            return res.status(200).json({ success: true, message: "User accepted into the squad!", room });

        } else if (action === 'reject') {
            // Mark as rejected instead of deleting to prevent "spam" requests
            room.invites[inviteIndex].status = 'rejected';
            
            await room.save();
            return res.status(200).json({ success: true, message: "Request declined", room });
        }

        res.status(400).json({ message: "Invalid action" });

    } catch (error) {
        console.error("Invite Action Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getRoomDetails = async (req, res) => {
    try {
        const { roomCode } = req.params;

        // Find room by code, but only select non-sensitive fields
        const room = await TripRoom.findOne({ roomCode })
            .select('tripName roomCode roomLeaderId invites members')
            .lean();

        if (!room) {
            return res.status(404).json({ message: "Invalid Room Code. Please check again." });
        }

        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error("Fetch Room Details Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getMyRooms = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find rooms where the members array contains an object with this userId
        const rooms = await TripRoom.find({
            "members.userId": userId
        })
        .sort({ createdAt: -1 })
        .select("-__v"); // Clean up the response by removing Mongoose version key

        // If no rooms found, return an empty array 
        if (!rooms) {
            return res.status(200).json([]);
        }

        res.status(200).json(rooms);

    } catch (error) {
        console.error("Error in getMyRooms:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const viewRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        // 1. Populate to get the color, but use .lean() to make it a plain JS object
        const room = await TripRoom.findById(roomId)
            .populate('members.userId', 'color')
            .lean(); 

        if (!room) return res.status(404).json({ message: "Room not found" });

        // 2. THE FLATTENING: Transform the data back to your "Old Structure"
        room.members = room.members.map(member => ({
            ...member,
            color: member.userId?.color || "#11889c", // Add color to the top level
            userId: member.userId?._id || member.userId // Put the ID string back
        }));

        // 3. Keep the Leader ID as a string too if it got populated
        if (room.roomLeaderId?._id) {
            room.roomLeaderId = room.roomLeaderId._id;
        }

        // Now the frontend gets exactly what it expects!
        res.status(200).json(room);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateVisibility = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { visibility } = req.body;
        const userId = req.user._id;

        if (!['public', 'private'].includes(visibility)) {
            return res.status(400).json({ message: "Invalid visibility type. Use 'public' or 'private'." });
        }

        const room = await TripRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Only the Room Leader can change settings
        if (room.roomLeaderId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                message: "Access Denied. Only the Room Leader can change visibility settings." 
            });
        }

        // Update and Save
        room.visibility = visibility;
        await room.save();

        res.status(200).json({
            message: `Room is now ${visibility}`,
            room
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateTripStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        // Check if the status is valid based on your schema enum
        const allowedStatuses = ['planned', 'active', 'completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Use 'planned', 'active', or 'completed'." 
            });
        }

        const room = await TripRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Room Leader can change the trip's status
        if (room.roomLeaderId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                message: "Permission Denied. Only the Room Leader can start or end a trip." 
            });
        }

        room.status = status;
        await room.save();

        res.status(200).json({
            message: `Trip status updated to ${status}`,
            room
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// send trip invitation
const sendTripInvite = async (req, res) => {
    try {
        const { email, tripName, roomCode } = req.body;
        const senderName = req.user.userName; // From your auth middleware
        // const joinLink = `${process.env.FRONTEND_URL}/join/${roomCode}`;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const joinLink = `${baseUrl}/join/${roomCode}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS.trim()
            }
        });

        const htmlContent = `
        <div style="font-family: sans-serif; background-color: #f0f9ff; padding: 40px; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e0f2fe;">
                <div style="background-color: #11889c; padding: 30px; color: white;">
                    <h1 style="margin: 0; font-size: 24px; letter-spacing: -1px;">TripMate Invitation</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">You've been invited!</p>
                    <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
                        <strong>${senderName}</strong> wants you to join the adventure: <br/>
                        <span style="font-size: 20px; color: #ea580c; font-weight: 900; italic: true;">"${tripName}"</span>
                    </p>
                    
                    <table style="width: 100%; margin: 30px 0; border-collapse: collapse; background-color: #f8fafc; border-radius: 16px;">
                        <tr>
                            <td style="padding: 20px; text-align: center;">
                                <span style="display: block; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">Room Code</span>
                                <span style="font-family: monospace; font-size: 24px; color: #1e293b; font-weight: bold; letter-spacing: 4px;">${roomCode}</span>
                            </td>
                        </tr>
                    </table>

                    <a href="${joinLink}" style="display: inline-block; background-color: #11889c; color: white; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(17,136,156,0.3);">
                        Join the Squad
                    </a>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; color: #94a3b8; font-size: 11px;">
                    If the button doesn't work, copy this link: <br/> ${joinLink}
                </div>
            </div>
        </div>`;

        await transporter.sendMail({
            from: `"TripMate" <${process.env.EMAIL}>`,
            to: email,
            subject: `Join ${senderName} on the trip: ${tripName}`,
            html: htmlContent
        });

        res.status(200).json({ message: "Invitation sent successfully!" });

    } catch (error) {
        console.error("Invite Email Error:", error);
        res.status(500).json({ error: "Failed to send invitation" });
    }
};


export {createRoom, joinRoom, getRoomDetails, getMyRooms, viewRoom, updateVisibility, updateTripStatus, handleInviteAction, sendTripInvite };