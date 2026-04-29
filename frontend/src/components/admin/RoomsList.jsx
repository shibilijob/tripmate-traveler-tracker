import React, { useState, useEffect } from 'react';
import { FaBan, FaDoorOpen, FaSearch, FaTimes, FaTrash, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ADMIN_API from '../../api/ADMIN_API';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await ADMIN_API.get('/allRooms');
      setRooms(res.data.rooms || []);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleKickMember = async (roomId, userId) => {
    if (!window.confirm("KICK THIS USER FROM THE TRIP?")) return;
    const tid = toast.loading("REMOVING MEMBER...");
    try {
      await ADMIN_API.delete(`/room/${roomId}/kick/${userId}`);
      toast.success("MEMBER KICKED", { id: tid });
      fetchRooms(); 
      setShowModal(false); 
    } catch (error) {
      toast.error(error.response?.data?.message || "KICK FAILED", { id: tid });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("DELETE THIS ENTIRE TRIP ROOM? This cannot be undone.")) return;
    const tid = toast.loading("Destroying room...");
    try {
      await ADMIN_API.delete(`/deleteRoom/${roomId}`); 
      toast.success('Room deleted', { id: tid });
      setShowModal(false);
      fetchRooms();
    } catch (error) {
      toast.error("Failed to delete room", { id: tid });
    }
  };

  const openMembersModal = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  // Filter logic for the cards
  const filteredRooms = rooms.filter(room => 
    room.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cyan-50 rounded-xl border border-cyan-200 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Room <span className="text-[#11889c]">Registry</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Trip Management</p>
          </div>
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME, CODE, OR DEST..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#11889c] outline-none font-black text-xs uppercase shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Room Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="font-black text-slate-300 animate-pulse text-2xl uppercase italic">Syncing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredRooms.map((room) => (
              <div 
                key={room._id} 
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-cyan-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex-1  h-[230px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#11889c]/10 p-3 rounded-2xl text-[#11889c] group-hover:bg-[#11889c] group-hover:text-white transition-colors">
                    <FaDoorOpen className="text-xl" />
                  </div>
                  <div className="flex gap-2">
                     <span className="text-[10px] bg-cyan-50 text-[#11889c] px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-cyan-100">
                       {room.members?.length || 0} Members
                     </span>
                     <button 
                       onClick={() => handleDeleteRoom(room._id)}
                       className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                       title="Delete Room"
                     >
                       <FaTrash size={14} />
                     </button>
                  </div>
                </div>
                
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-1">{room.tripName}</h3>
                <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest italic">
                  {room.destination} • {new Date(room.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-[10px] text-slate-400 font-black uppercase">
                    Code: <span className="text-[#11889c] font-mono text-xs ml-1 bg-slate-50 px-2 py-1 rounded-md">#{room.roomCode}</span>
                  </span>
                  <button 
                    onClick={() => openMembersModal(room)}
                    className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#fb6c03] transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <div className="w-full text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-cyan-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No rooms found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBER DETAILS MODAL (UNCHANGED LOGIC, UPDATED STYLE) */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative z-10 bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-[#11889c] p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">{selectedRoom.tripName}</h2>
                <p className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] mt-2">Squad Manage</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-8 max-h-[50vh] overflow-y-auto">
              <div className="space-y-3">
                {selectedRoom.members.map((member) => (
                  <div key={member.userId || member._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white hover:border-cyan-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#11889c] text-white rounded-xl flex items-center justify-center font-black shadow-inner">
                        {member.userName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-800">
                          {member.userName} 
                          {member.userId === selectedRoom.roomLeaderId && <span className="ml-2 text-[7px] bg-orange-500 text-white px-2 py-0.5 rounded-full vertical-middle">LEADER</span>}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{member.role || 'Member'}</p>
                      </div>
                    </div>

                    <button 
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                      onClick={() => handleKickMember(selectedRoom._id, member.userId)}
                    >
                      <FaBan
                       size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
              <button 
                className="w-full py-4 bg-red-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-[0.98]"
                onClick={() => handleDeleteRoom(selectedRoom._id)}
              >
                Terminate Entire Trip Room
              </button>
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Warning: This action is irreversible</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsList;