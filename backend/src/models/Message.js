import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { 
      type: String, 
      required: true, 
      index: true // Makes searching by room much faster
    },
    sender: { 
      type: String, 
      required: true 
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: { 
      type: String, 
      required: true 
    },
    time: { 
      type: Date, 
      default: Date.now,
      expires: 1209600
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;