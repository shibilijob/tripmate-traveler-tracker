import bcrypt from "bcrypt"
import User from "../../models/User.js"
import generateToken from "../../utils/genToken.js"
import nodemailer from "nodemailer"
import TripRoom from "../../models/TripRoom.js"

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

        generateToken(res,user._id)

        res.status(201).json({message:'user registered',userData})

        
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
        generateToken(res,user._id)
        const userData = {
            _id:user._id,
            userName:user.userName,
            email:user.email,
            role:user.role,
        }
        res.status(200).json({message:'login successfull',userData})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
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


export {signupUser, loginUser, logoutUser, forgotPassword, verifyOTP, resetPassword, getProfile, updateProfile};