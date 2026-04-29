import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaHome, FaMapMarkedAlt, FaClock, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { joinRoom, getRoomDetails } from '../../../redux/slices/roomSlice';
import USER_API from "../../../api/USER_API"

const RoomEntrance = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const queryParams = new URLSearchParams(location.search);
  const invitedEmail = queryParams.get('email'); 

  const [isSending, setIsSending] = useState(false);
  const [localPending, setLocalPending] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { currentRoom, loading } = useSelector((state) => state.rooms);

  useEffect(() => {
    if (roomCode) {
      dispatch(getRoomDetails(roomCode));
    }
  }, [roomCode, dispatch]);

  const hasPendingRequest = currentRoom?.invites?.some(
    (invite) => invite.userId === user?._id && invite.status === 'pending'
  ) || localPending;

  const hasRejectedRequest = currentRoom?.invites?.some(
    (invite) => invite.userId === user?._id && invite.status === 'rejected'
  );

  const handleJoinAction = async (status = 'request') => {
    if (!user) {
      localStorage.setItem('pendingJoinCode', roomCode);
      navigate('/login');
      return;
    }

    setIsSending(true);
    try {
  const res = await USER_API.post("/joinRoom", {
    roomCode:roomCode,
    action: status,
  });

  const roomId = res.data.room?._id;

  // If request (not invite accept), set local pending
  if (!roomId && status === 'request') {
    setLocalPending(true);
  }

  toast.success(
    roomId
      ? "Welcome to the squad!"
      : res.data.message || "you are not invited. so Request sent to the Room Leader!"
  );

  if (roomId) {
    navigate(`/TripRoom/${roomId}`);
  }

} catch (err) {
  toast.error(err.response?.data?.message || "Action failed");
} finally {
  setIsSending(false);
}
  };

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
        
        <div className="w-20 h-20 bg-cyan-100 text-[#11889c] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          {user ? <FaMapMarkedAlt size={40} /> : <FaLock size={35} />}
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800 mb-2">
          {currentRoom?.tripName || 'New'} <span className="text-orange-600">Adventure ?</span>
        </h1>
        
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
          Room Code: <span className="text-[#11889c] font-mono">{roomCode}</span>
        </p>

        <p className="text-slate-600 text-sm font-medium mb-10 leading-relaxed">
          {!user 
            ? "You need to be logged in to join this squad."
            : invitedEmail 
            ? `Hey ${user.userName}, you have a special invite to join this trip!` 
            : hasPendingRequest 
            ? "Your request is currently under review by the Room Leader."
            : hasRejectedRequest
            ? "Your request was rejected by the Room Leader."
            : "You found a squad! Send a request to join the adventure."
          }
        </p>

        <div className="flex flex-col gap-4">
          {!user ? (
            <button
              onClick={() => {
                localStorage.setItem('pendingJoinCode', roomCode);
                navigate('/login');
              }}
              className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
            >
              Login to Proceed
            </button>
          ) : invitedEmail ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleJoinAction('accept')}
                disabled={isSending}
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#11889c] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0e6e7d] shadow-lg shadow-cyan-200"
              >
                <FaCheck /> Accept & Join
              </button>
              <button
                onClick={async () => {
                  await handleJoinAction('reject');
                  navigate('/');
                }}
                className="flex items-center justify-center gap-3 w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all"
              >
                <FaTimes /> Reject Invite
              </button>
            </div>
          ) : hasPendingRequest ? (
            <div className="flex items-center justify-center gap-3 w-full py-4 bg-orange-50 text-orange-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-orange-100">
              <FaClock className="animate-pulse" /> Request Pending
            </div>
          ) : hasRejectedRequest ? (
            <div className="flex items-center justify-center gap-3 w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest border border-red-100">
              <FaTimes /> Request already Rejected
            </div>
          ) : (
            /* button for WhatsApp/Direct */
            <button
              onClick={() => handleJoinAction('request')}
              disabled={isSending}
              className="group flex items-center justify-center gap-3 w-full py-4 bg-[#11889c] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0e6e7d] transition-all"
            >
              {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
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
            <FaHome /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomEntrance;