import mongoose from "mongoose";

const memberLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  initialLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const locationSchema = new mongoose.Schema(
  {
    tripRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripRoom",
      required: true,
    },
    tripName: {
      type: String,
      required: true,
    },
    membersLocations: [memberLocationSchema],
    timeStamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const Location = mongoose.model("Location", locationSchema);

export default Location;