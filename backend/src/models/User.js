import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName:{type:String,required:true,trim:true},
    email:{type:String,required:true,unique:true,lowercase:true,trim:true},
    password:{type:String,required:true},
    role:{type:String,enum:['member','admin','roomLeader'],default:'member'},
    profilePic:{type:String,default:""},
    color: {
        type: String,
        default: () => {
        const colors = ["#11889c", "#e67e22", "#9b59b6", "#2ecc71", "#bb2716", "#2908a0"];
        return colors[Math.floor(Math.random() * colors.length)];
        }
    },
    status:{type:String, enum:['active','blocked'], default:'active'}
},
{
    timestamps:true
})

const User = mongoose.model('User',userSchema)

export default User;