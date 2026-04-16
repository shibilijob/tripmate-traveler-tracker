import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaHome, FaMapMarkedAlt, FaClock, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { joinRoom, getRoomDetails } from '../../../redux/slices/roomSlice';

const RoomEntrance = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isSending, setIsSending] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { currentRoom, loading } = useSelector((state) => state.rooms);

  // 1. Fetch Room Details on load to show Trip Name
  useEffect(() => {
    if (roomCode) {
      dispatch(getRoomDetails(roomCode));
    }
  }, [roomCode, dispatch]);

  // 2. Check if user already has a pending invite
  const hasPendingRequest = currentRoom?.invites?.some(
    (invite) => invite.userId === user?._id && invite.status === 'pending'
  );

  const handleRequest = async () => {
    if (!user) {
      localStorage.setItem('pendingJoinCode', roomCode);
      navigate('/login');
      return;
    }

    setIsSending(true);
    try {
      await dispatch(joinRoom(roomCode)).unwrap();
      toast.success("Request sent to the Room Leader!");
    } catch (err) {
      toast.error(err || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  // Loading State
  if (loading && !currentRoom) {
    return (
      <div className="min-h-screen bg-cyan-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#11889c] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locating Trip...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-10">
        
        {/* Dynamic Icon based on Login Status */}
        <div className="w-20 h-20 bg-cyan-100 text-[#11889c] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          {user ? <FaMapMarkedAlt size={40} /> : <FaLock size={35} />}
        </div>

        {/* Header */}
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800 mb-2">
          {currentRoom?.tripName || 'New'} <span className="text-orange-600">Adventure ?</span>
        </h1>
        
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
          Room Code: <span className="text-[#11889c] font-mono">{roomCode}</span>
        </p>

        {/* Instruction Text */}
        <p className="text-slate-600 text-sm font-medium mb-10 leading-relaxed">
          {!user 
            ? "You need to be logged in to join this squad. Click below to secure your spot."
            : hasPendingRequest 
            ? "Your request is currently under review by the Room Leader. Check back later!"
            : "You’ve been invited! Send a request to the Room Leader to access the squad's map and chat."
          }
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-4">
          {!user ? (
            <button
              onClick={() => {
                localStorage.setItem('pendingJoinCode', roomCode);
                navigate('/login');
              }}
              className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all transform hover:scale-[1.02]"
            >
              Login to Join
            </button>
          ) : hasPendingRequest ? (
            <div className="flex items-center justify-center gap-3 w-full py-4 bg-orange-50 text-orange-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-orange-100">
              <FaClock className="animate-pulse" />
              Request Pending
            </div>
          ) : (
            <button
              onClick={handleRequest}
              disabled={isSending}
              className="group flex items-center justify-center gap-3 w-full py-4 bg-[#11889c] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0e6e7d] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-200"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Ask to Join Squad
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 w-full py-4 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
          >
            <FaHome />
            Back to Home
          </button>
        </div>

        {user && (
          <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Logged in as: <span className="text-slate-400">{user?.userName}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomEntrance;