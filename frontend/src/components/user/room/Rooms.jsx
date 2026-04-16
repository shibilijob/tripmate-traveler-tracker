import React, { useState, useEffect } from 'react';
import { FaPlus, FaHashtag, FaQrcode, FaCompass } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
// Assuming you have these actions in your roomSlice
import { fetchMyRooms, createRoom, joinRoom } from "../../../redux/slices/roomSlice";

const Rooms = () => {
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'active'
  const [showModal, setShowModal] = useState(false);
  
  // Form States
  const [roomData, setRoomData] = useState({ tripName: '', destination: '' });
  const [joinCode, setJoinCode] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(fetchMyRooms());
  }, [dispatch]);

  const handleCreateRoom = async () => {
    if (!roomData.tripName || !roomData.destination) return alert("Please fill all fields");
    
    // Dispatch create action (logic inside your slice)
    const result = await dispatch(createRoom(roomData));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowModal(false);
      setRoomData({ tripName: '', destination: '' });
      setActiveTab('active'); // Switch to see the new room
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.length < 6) return alert("Enter a valid 6-digit code");

    navigate(`/join/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-cyan-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-800">
              Trip<span className="text-orange-600">Rooms</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect with your squad</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-cyan-100">
            <button 
              onClick={() => setActiveTab('join')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'join' ? 'bg-[#11889c] text-white shadow-lg' : 'text-slate-400'}`}
            >
              Join / Create
            </button>
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'active' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              My Rooms
            </button>
          </div>
        </div>

        {activeTab === 'join' ? (
          /* JOIN & CREATE SECTION */
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Create Room Card */}
            <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-xl border border-cyan-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
                <FaPlus size={32} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase">Host a Trip</h2>
              <p className="text-sm text-slate-400 mb-8 font-medium">Create a room and invite your friends to track your journey together.</p>
              <button 
                className="w-full py-4 bg-[#11889c] text-white rounded-2xl font-black tracking-widest hover:bg-cyan-600 transition-all active:scale-95 shadow-xl"
                onClick={() => setShowModal(true)}
              >
                CREATE NEW ROOM
              </button>
            </div>

            {/* Join Room Card */}
            <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-xl border border-cyan-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase">Join Squad</h2>
                <FaQrcode size={20} className="text-slate-300" />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      // Optional: dispatch a 'clearError' action here if you have one
                    }}
                    placeholder="ENTER 6-DIGIT CODE" 
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-black placeholder:text-slate-300 outline-none transition-all uppercase ${
                      error ? 'border-red-500' : 'border-cyan-100 focus:border-[#11889c]'
                    }`}
                  />
                </div>
                
                <button 
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-xl shadow-red-100 disabled:opacity-50"
                >
                  {loading ? "CHECKING..." : "ENTER ROOM"}
                </button>

                {/* ERROR MESSAGE BELOW BUTTON */}
                {error && (
                  <p className="text-red-500 text-xs font-black uppercase tracking-tighter text-center mt-2 animate-bounce">
                    ⚠️ {typeof error === 'string' ? error : error.message || "Invalid Room Code"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE ROOM DASHBOARD */
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.length === 0 ? (
              <div className="w-full text-center py-20">
                 <p className="text-slate-400 font-bold">No rooms found. Time to plan a trip!</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div 
                  key={room._id}
                  className="w-full max-w-sm bg-[#11889a] rounded-xl p-5 text-white shadow-lg relative overflow-hidden group transform transition-all hover:shadow-2xl hover:-translate-y-2 duration-500 ease-out"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                  
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                        <FaCompass size={22} className="text-red-500 animate-pulse" />
                      </div>

                      <div className="overflow-hidden">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter truncate leading-tight">
                          {room.tripName}
                        </h2>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-black bg-red-600 px-2 py-1 rounded uppercase">
                            {room.status || 'Active'}
                          </span>
                          <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded uppercase tracking-tighter text-slate-200">
                            #{room.roomCode}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Destination</p>
                        <p className="text-md font-black leading-none">{room.destination}</p>
                      </div>
                      
                      <button 
                        className="px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[12px] uppercase hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-lg"
                        onClick={() => navigate(`/tripRoom/${room._id}`)}
                      >
                        VIEW ROOM
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative z-10 bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-cyan-100">
            <h2 className="text-2xl font-black mb-2 uppercase text-center">Create Room</h2>
            <p className="text-sm text-slate-400 mb-6 text-center font-medium">
              Start your journey and invite your squad!
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Trip Name (e.g., Goa Vibes)"
                value={roomData.tripName}
                onChange={(e) => setRoomData({...roomData, tripName: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-cyan-50 rounded-2xl outline-none focus:border-[#11889c] font-bold"
              />

              <input
                type="text"
                placeholder="Where to?"
                value={roomData.destination}
                onChange={(e) => setRoomData({...roomData, destination: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-cyan-50 rounded-2xl outline-none focus:border-[#11889c] font-bold"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 shadow-lg shadow-orange-100"
                  onClick={handleCreateRoom}
                >
                  Launch Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;