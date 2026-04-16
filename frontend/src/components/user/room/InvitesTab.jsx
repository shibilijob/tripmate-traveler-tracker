import React from 'react';
import { FaCheck, FaTimes, FaClock, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const StatusHeader = ({ icon: Icon, title, colorClass }) => (
  <header className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <Icon className={colorClass} size={12} />
    <p className={`text-[10px] font-black tracking-[0.2em] uppercase ${colorClass}`}>
      {title}
    </p>
  </header>
);

const UserRow = ({ invite, onAction, showActions }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-2 transition-all hover:border-cyan-100">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-[#11889c] text-xs">
        {invite.userName?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-black text-slate-700 leading-none mb-1">{invite.userName}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{invite.email}</p>
      </div>
    </div>

    {showActions && (
      <div className="flex gap-2">
        <button 
          onClick={() => onAction(invite.userId, 'accept')}
          className="p-2.5 bg-white text-emerald-500 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
        >
          <FaCheck size={10} />
        </button>
        <button 
          onClick={() => onAction(invite.userId, 'reject')}
          className="p-2.5 bg-white text-red-400 rounded-xl shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all"
        >
          <FaTimes size={10} />
        </button>
      </div>
    )}
  </div>
);

const InvitesTab = ({ invites = [], onAction }) => {
  const pending = invites.filter(i => i.status === 'pending');
  const accepted = invites.filter(i => i.status === 'accepted');
  const rejected = invites.filter(i => i.status === 'rejected');

  return (
    <div className="animate-fadeIn">
      {/* PENDING */}
      <StatusHeader icon={FaClock} title="Pending Requests" colorClass="text-orange-500" />
      {pending.length > 0 ? (
        pending.map(i => <UserRow key={i.userId} invite={i} onAction={onAction} showActions={true} />)
      ) : (
        <p className="text-[10px] font-bold text-slate-300 italic px-4">No pending requests</p>
      )}

      {/* ACCEPTED */}
      <StatusHeader icon={FaUserCheck} title="Joined Squad" colorClass="text-emerald-500" />
      {accepted.map(i => <UserRow key={i.userId} invite={i} />)}

      {/* REJECTED */}
      <StatusHeader icon={FaUserTimes} title="Declined" colorClass="text-red-300" />
      {rejected.map(i => <UserRow key={i.userId} invite={i} />)}
    </div>
  );
};

export default InvitesTab;