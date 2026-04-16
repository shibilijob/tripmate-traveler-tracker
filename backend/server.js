import dotenv from "dotenv";
dotenv.config()

import express from "express";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import adminRoutes from "./src/routes/adminRoutes.js"
import cookieParser from "cookie-parser";
import cors from "cors"

import http from "http"
import { Server } from "socket.io";
import Message from "./src/models/Message.js";
import Location from "./src/models/Location.js";

const app = express()

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});


app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://your-frontend-link.vercel.app' // should add vercel link here
    ],
    credentials: true
}));
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use('/auth',authRoutes)
app.use('/user',userRoutes)
app.use('/admin',adminRoutes)


const liveLocations = {};
const lastSaveTime = {}; // to track last location from db

// SOCKET LOGIC (REAL-TIME)
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("joinRoom", async(roomId) => {
        socket.join(roomId);
        console.log("Joined room:", roomId);

        try {
            //firstly take location from db 
            const tripLog = await Location.findOne({ tripRoomId: roomId });
            let formattedLocations = {};

            if (tripLog) {
                tripLog.membersLocations.forEach(m => {
                    if (m.lastLocation?.lat) {
                        formattedLocations[m.userId] = {
                            lat: m.lastLocation.lat,
                            lng: m.lastLocation.lng,
                            speed: 0 
                        };
                    }
                });
            }

            //merg the user in live
            if (liveLocations[roomId]) {
                formattedLocations = { ...formattedLocations, ...liveLocations[roomId] };
            }

            socket.emit("initialLocations", formattedLocations);
        } catch (err) {
            console.error("JoinRoom Error:", err);
        }
    });
    // leave room
    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
    });

    // Send messages
    socket.on("sendMessage", async ({ roomId, message, sender, senderId, id }) => {
        try {
            // Create and save the message to MongoDB
            const newMessage = new Message({
                roomId,
                message,
                sender,
                senderId
            });

            await newMessage.save();

            // Broadcast to the room
            io.to(roomId).emit("receiveMessage", {
                id, // Keep passing the frontend's temporary ID for the "tick" marks
                message: newMessage.message,
                sender: newMessage.sender,
                time: newMessage.time,
            });
            
        } catch (error) {
            console.error("Error saving message:", error);
            // Optional: emit an error back to the sender
            socket.emit("error", "Message could not be saved.");
        }
    });

    // LIVE LOCATION TRACKING
    let lastSent = 0;

    socket.on("sendLocation", async (data) => {
        const { roomId, coords, speed, userId } = data;
        const now = Date.now();

        // 1. send location to others (Real-time movement)
        if (!liveLocations[roomId]) liveLocations[roomId] = {};
        liveLocations[roomId][userId] = { coords, speed, lastUpdated: now };

        io.to(roomId).emit("locationUpdated", { userId, coords, speed });

        // 2. update to db in 5 minut interval
        const saveInterval = 300000; // 5 minutes
        if (!lastSaveTime[userId] || now - lastSaveTime[userId] > saveInterval) {
            try {
                const log = await Location.findOne({ tripRoomId: roomId });
                if (log) {
                    const member = log.membersLocations.find(m => m.userId.toString() === userId);
                    if (member) {
                        // if loc at first time set initialLocation 
                        if (!member.initialLocation.lat) {
                            member.initialLocation = coords;
                        }
                        member.lastLocation = coords;
                        await log.save();
                        lastSaveTime[userId] = now;
                        console.log(`DB updated for ${userId}`);
                    }
                }
            } catch (err) {
                console.error("DB Save Error:", err);
            }
        }
    });
});


const port = process.env.PORT
server.listen(port,()=>{
    console.log(`server running in ${port}`)
})