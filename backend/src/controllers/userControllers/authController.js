import bcrypt from "bcrypt"
import User from "../../models/User.js"
import generateTokens from "../../utils/genToken.js"
import nodemailer from "nodemailer"
import TripRoom from "../../models/TripRoom.js"
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No Refresh Token in Cookies" });
        }

        // 1. Verify Refresh Token (Direct way)
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // 2. If valid, generate new Access Token
        const accessToken = jwt.sign(
            { id: decoded.id }, 
            process.env.JWT_ACCESS_SECRET, 
            { expiresIn: '15m' }
        );

        // 3. Send response
        return res.status(200).json({ accessToken });

    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        // Token expired or invalid  send status 403
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Invalid or Expired Refresh Token" });
        }

        // other errors -> 500 status
        res.status(500).json({ message: "Server Error" });
    }
};

const signupUser =async(req,res)=>{
    try {
        const {userName,email,password} = req.body
        if(!userName || !email || !password){
            return res.status(400).json({message:'fill all fields'})
        }
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({message:'user already registered'})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        
        const user = await User.create({
            userName,
            email,
            password:hashedPassword,
        })

        const userData = {
            _id:user._id,
            userName:user.userName,
            email:user.email,
            role:user.role,
        }

        const token = generateTokens(res,user._id)

        res.status(201).json({message:'user registered',userData, token})

        
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

const loginUser = async(req,res)=>{
    try {
        const {email,password} = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message:'invalid credentials'})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({message:'invalid credentials'})
        }
        const token = generateTokens(res,user._id)
        const userData = {
            _id:user._id,
            userName:user.userName,
            email:user.email,
            role:user.role,
        }
        res.status(200).json({message:'login successfull',userData, token})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

// login by google
const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // if there is no user then create a user
            // make random password due to its required
            const generatedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            
            user = await User.create({
                userName: name,
                email: email,
                password: generatedPassword,
                isVerified: true 
            });
        }

        const appToken = generateTokens(res, user._id);

        const userData = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role,
        };

        res.status(200).json({ 
            message: 'Google login successful', 
            userData, 
            token: appToken 
        });

    } catch (error) {
        console.error("Google Auth Error:", error.message);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

const otpStore = {}

//forgot-password
const forgotPassword = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS.trim()
      }
    });

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    await transporter.sendMail({
      from: `"TripMate Support" <${process.env.EMAIL}>`,
      to: email,
      subject: 'TripMate - Password Reset OTP',
      html: `<h3>Your OTP is: <b>${otp}</b></h3>`
    });

    res.json({ message: 'OTP sent' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Email sending failed' });
  }
};

//verify-otp
const verifyOTP = (req, res) => {
  const { email, otp } = req.body
  const record = otpStore[email]
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: 'Invalid or expired OTP' })

  res.json({ message: 'OTP verified' })
}

//reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  const record = otpStore[email]
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: 'OTP expired, try again' })

  const hashed = await bcrypt.hash(newPassword, 10)
  await User.findOneAndUpdate({ email }, { password: hashed })
  delete otpStore[email]

  res.json({ message: 'Password reset successful' })
}

const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get basic user info
        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Fetch all rooms where the user is a member
        const allUserRooms = await TripRoom.find({
            "members.userId": userId
        }).sort({ createdAt: -1 });

        // 3. Aggregate Trip Stats
        const stats = {
            totalRooms: allUserRooms.length,
            plannedTrips: allUserRooms.filter(room => room.status === 'planned').length,
            activeTrips: allUserRooms.filter(room => room.status === 'active').length,
            completedTrips: allUserRooms.filter(room => room.status === 'completed').length,
            // Get the 3 most recent rooms for the activity list
            recentRooms: allUserRooms.slice(0, 3).map(room => ({
                name: room.tripName,
                date: new Date(room.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                id: room._id
            }))
        };

        // 4. Combine and send response
        res.status(200).json({
            ...user,
            ...stats
        });

    } catch (error) {
        console.error("Error in getProfile:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// color changer
const updateProfile = async (req, res) => {
    try {
        const { color } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { color }, 
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export {refreshAccessToken, signupUser, loginUser, googleLogin, logoutUser, forgotPassword, verifyOTP, resetPassword, getProfile, updateProfile};