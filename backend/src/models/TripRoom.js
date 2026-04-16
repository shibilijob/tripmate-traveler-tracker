import mongoose from 'mongoose';

const tripRoomSchema = new mongoose.Schema({
  tripName: {type: String, required: true, trim: true},
  destination: {type: String, required:true, trim:true},
  visibility: {type: String, enum: ['public', 'private'], default: 'private'},
  roomLeaderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  roomCode: {type: String, unique: true, uppercase: true, trim: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  status: {type: String, enum: ['planned', 'active', 'completed'], default: 'planned'},
  roomStatus:{type:String, enum:['active','blocked'], default:'active'},
  
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      userName: String,
      role: {
        type: String,
        enum: ['roomLeader', 'member'],
        default: 'member',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  
  invites: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      email: String,
      status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
      },
      requestedAt: { type: Date, default: Date.now }
    }
  ]
}, { 
  timestamps: true
});


const TripRoom = mongoose.model('TripRoom', tripRoomSchema);

export default TripRoom;