import React from 'react';
import { FaCheck, FaTimes, FaClock, FaUserCheck, FaUserTimes, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const StatusHeader = ({ icon: Icon, title, colorClass }) => (
  <header className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
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
        {/* if there is not User name take first letter of email */}
        {(invite.userName || invite.email)?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-black text-slate-700 leading-none mb-1">
          {invite.userName || 'Pending User'}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{invite.email}</p>
      </div>
    </div>

    {showActions && onAction && (
      <div className="flex gap-2">
        <button 
          onClick={() => onAction(invite.userId || invite.email, 'accept')}
          className="p-2.5 bg-white text-emerald-500 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
        >
          <FaCheck size={10} />
        </button>
        <button 
          onClick={() => onAction(invite.userId || invite.email, 'reject')}
          className="p-2.5 bg-white text-red-400 rounded-xl shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all"
        >
          <FaTimes size={10} />
        </button>
      </div>
    )}
  </div>
);

const InvitesTab = ({ invites = [], invitedByEmail = [], onAction }) => {
  // Existing logic
  const pending = invites.filter(i => i.status === 'pending');
  const accepted = invites.filter(i => i.status === 'accepted');
  const rejected = invites.filter(i => i.status === 'rejected');

  // Email logic
  const emailPending = invitedByEmail.filter(i => i.status === 'pending');
  const emailAccepted = invitedByEmail.filter(i => i.status === 'accepted');
  const emailRejected = invitedByEmail.filter(i => i.status === 'rejected');

  return (
    <div className="animate-fadeIn">
      {/* --- REGULAR INVITES --- */}
      <div className=" pt-6 border-t border-dashed border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <FaWhatsapp className="text-slate-400" size={14} />
          <h3 className="text-xs font-bold text-slate-500 tracking-wider"> INVITATIONS FROM USERS</h3>
        </div>
        <StatusHeader icon={FaClock} title="Pending Requests" colorClass="text-orange-500" />
        {pending.length > 0 ? (
          pending.map(i => <UserRow key={i.userId} invite={i} onAction={onAction} showActions={true} />)
        ) : (
          <p className="text-[10px] font-bold text-slate-300 italic px-4">No pending requests</p>
        )}

        <StatusHeader icon={FaUserCheck} title="Joined Squad" colorClass="text-emerald-500" />
        {accepted.map(i => <UserRow key={i.userId} invite={i} />)}

        <StatusHeader icon={FaUserTimes} title="Declined" colorClass="text-red-300" />
        {rejected.map(i => <UserRow key={i.userId} invite={i} />)}
      </div>

      {/* --- EMAIL INVITES SECTION --- */}
      <div className="mt-10 pt-6 border-t border-dashed border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <FaEnvelope className="text-slate-400" size={14} />
          <h3 className="text-xs font-bold text-slate-500 tracking-wider">EMAIL INVITATIONS</h3>
        </div>

        {/* Email Pending */}
        <StatusHeader icon={FaClock} title="Pending" colorClass="text-orange-400" />
        {emailPending.length > 0 ? (
          emailPending.map((i, idx) => (
            <UserRow key={idx} invite={i} />
          ))
        ) : (
          <p className="text-[10px] font-bold text-slate-300 italic px-4">No pending email invites</p>
        )}

        {/* Email Accepted */}
        <StatusHeader icon={FaUserCheck} title="Accepted" colorClass="text-emerald-400" />
        {emailAccepted.map((i, idx) => <UserRow key={idx} invite={i} />)}

        {/* Email Rejected */}
        <StatusHeader icon={FaUserTimes} title="Rejected" colorClass="text-red-200" />
        {emailRejected.map((i, idx) => <UserRow key={idx} invite={i} />)}
      </div>
    </div>
  );
};

export default InvitesTab;