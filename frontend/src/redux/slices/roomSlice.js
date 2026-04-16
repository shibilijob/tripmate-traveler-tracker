import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import USER_API from "../../api/USER_API";

// API call
export const fetchMyRooms = createAsyncThunk(
  "rooms/fetchMyRooms",
  async (_, thunkAPI) => {
    try {
      const res = await USER_API.get("/myRooms");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// CREATE A NEW ROOM
export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (roomData, thunkAPI) => {
    try {
      const res = await USER_API.post("/createRoom", roomData);
      return res.data.room; // Adjust based on your API response structure
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// JOIN A ROOM VIA CODE
export const joinRoom = createAsyncThunk(
  "rooms/joinRoom",
  async (roomCode, thunkAPI) => {
    try {
      const res = await USER_API.post("/joinRoom", { roomCode });
      return res.data.room;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// GET SINGLE ROOM
export const getRoomById = createAsyncThunk(
  "rooms/getRoomById",
  async (roomId, thunkAPI) => {
    try {
      const res = await USER_API.get(`/viewRoom/${roomId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
)

// Fetch room details by Code (For the AskToJoin Page)
export const getRoomDetails = createAsyncThunk("rooms/getRoomDetails", async (roomCode, thunkAPI) => {
  try {
    const res = await USER_API.get(`/roomDetails/${roomCode}`);
    return res.data.room;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

// Handle Accept/Reject (For the Room Leader)
export const handleInviteAction = createAsyncThunk(
  "rooms/handleInviteAction",
  async ({ roomId, targetUserId, action }, thunkAPI) => {
    try {
      const res = await USER_API.patch("/handleInvite", { roomId, targetUserId, action });
      return res.data.room; // Returns updated room with new member/invite status
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE STATUS
export const updateRoomStatus = createAsyncThunk(
  "rooms/updateStatus",
  async ({ roomId, status }, thunkAPI) => {
    try {
      const res = await USER_API.patch(`/status/${roomId}`, { status });
      return res.data.room;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
// update room status
export const updateRoomVisibility = createAsyncThunk(
  "rooms/updateVisibility",
  async ({ roomId, visibility }, thunkAPI) => {
    try {
      // Endpoint must match your route: e.g., /updateVisibility/:roomId
      const res = await USER_API.patch(`/visibility/${roomId}`, { visibility });
      return res.data.room; // Return the room object for the extraReducer
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Update failed");
    }
  }
);

// Slice
const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    currentRoom: null,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRoomById.pending, (state) => {
        state.loading = true;
      })
       .addCase(getRoomById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentRoom = action.payload;
      })
        .addCase(getRoomById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
      })

        // UPDATE STATUS
        .addCase(updateRoomStatus.fulfilled, (state, action) => {
            state.currentRoom = action.payload;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.unshift(action.payload); // Adds new room to the start of the list
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Room Details (for AskToJoin page)
      .addCase(getRoomDetails.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })

      // Handle Invite (Accept/Reject)
      .addCase(handleInviteAction.fulfilled, (state, action) => {
        state.currentRoom = action.payload; // Updates members and invites list instantly
      })

      // Handle Join Room Success
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.unshift(action.payload);
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update room privacy
      .addCase(updateRoomVisibility.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      .addCase(updateRoomVisibility.rejected, (state, action) => {
        state.error = action.payload;
      });

  },
});

export default roomSlice.reducer;