import React from 'react';
import { FaUserCircle, FaMapMarkerAlt, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

const JoinRequestModal = ({ invite, room, onAction, isProcessing }) => {
  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transform animate-popIn">
        
        {/* Header Section */}
        <div className="bg-cyan-50 p-6 text-center border-b border-cyan-100">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-sm mb-3 border-2 border-cyan-100">
            <FaUserCircle size={50} className="text-[#11889c]" />
          </div>
          <h2 className="text-xl font-black uppercase text-slate-800 tracking-tight">
            New Join Request!
          </h2>
          <p className="text-[10px] font-bold text-[#11889c] uppercase tracking-[0.2em] mt-1">
            TripMate Squad Link
          </p>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 text-orange-500"><FaMapMarkerAlt /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Trip</p>
              <p className="font-bold text-slate-700 uppercase italic">{room?.tripName}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 text-cyan-600"><FaUserCircle /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</p>
              <p className="font-bold text-slate-700">{invite.userName}</p>
              <p className="text-xs font-medium text-slate-500">{invite.email}</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-6 bg-slate-50 flex flex-col gap-2">
          <button 
            disabled={isProcessing}
            onClick={() => onAction(invite.userId, 'accept')}
            className="w-full py-3 bg-[#11889c] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#0e6e7d] flex items-center justify-center gap-2"
          >
            <FaCheck /> Accept to Squad
          </button>
          
          <div className="flex gap-2">
            <button 
              disabled={isProcessing}
              onClick={() => onAction(invite.userId, 'reject')}
              className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FaTimes /> Reject
            </button>
            <button 
              disabled={isProcessing}
              onClick={() => onAction(invite.userId, 'pending')}
              className="flex-1 py-3 bg-white text-orange-500 border border-orange-200 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
            >
              <FaClock /> Keep Pending
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;