import React, { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaSync, FaUserCircle, FaLock, FaUnlock } from 'react-icons/fa';
import ADMIN_API from '../../api/ADMIN_API';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await ADMIN_API.get('/allUsers');
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);
    
  // Delete user
  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setShowDeleteModal(true);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      await ADMIN_API.delete(`/deleteUser/${selectedUserId}`, { data: { reason: deleteReason } });
      toast.success('USER PERMANENTLY REMOVED');
      setShowDeleteModal(false);
      setDeleteReason("");
      fetchAllUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };
  
  async function handleBlock(id, currentStatus) {
    let reason = "";

    // 1. ask reason for block
    if (currentStatus === 'active') {
      const { value: text, isDismissed } = await Swal.fire({
        title: 'Block User',
        input: 'textarea',
        inputLabel: 'Reason for blocking',
        inputPlaceholder: 'Type the reason here...',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Confirm Block',
        inputValidator: (value) => {
          if (!value) {
            return 'You must provide a reason to block a user!';
          }
        }
      });

      if (isDismissed || !text) return; // cancel
      reason = text;
    } 
    
    // 2. confirmation only for unblock
    else {
      const result = await Swal.fire({
        title: 'Restore Access?',
        text: "Are you sure you want to reactivate this account?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2ed573',
        confirmButtonText: 'Yes, Restore'
      });

      if (!result.isConfirmed) return;
    }

    // 3. API Call
    try {
      await ADMIN_API.patch(`/blockAndUnblock/${id}`, { reason });
      
      toast.info(currentStatus === 'active' ? 'USER RESTRICTED AND NOTIFIED' : 'USER ACCESS RESTORED');
      fetchAllUsers(); 
    } catch (error) {
      toast.error('Failed to update user status');
    }
  }

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const commonReasons = [
  "Violation of community guidelines",
  "Spamming and fake profiles",
  "Inappropriate content sharing",
  "Multiple reports from users",
  "Security breach or suspicious activity"
  ];

  return (
    <div className="min-h-screen bg-cyan-50 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              User <span className="text-orange-600">Control</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">System Directory</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="SEARCH SQUAD..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#11889c] outline-none font-black text-xs uppercase transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={fetchAllUsers}
              className="p-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 text-[#11889c] transition-all"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-cyan-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11889c] border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-white">User Profile</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-white">User ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-white">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center font-black text-slate-300 animate-pulse tracking-widest">
                      LOADING SYSTEM DATA...
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-cyan-100 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#11889c] group-hover:bg-[#11889c] group-hover:text-white transition-all">
                          <FaUserCircle size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-slate-800">{user.userName}</p>
                          <p className="text-[10px] font-bold text-slate-400 lowercase">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded">
                        {user._id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter ${
                        user.role === 'admin' 
                        ? 'bg-orange-100 text-orange-600 border border-orange-200' 
                        : 'bg-cyan-50 text-[#11889c] border border-cyan-100'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right flex gap-2 justify-end">
                      {user.role !== 'admin' && (
                        <>
                          {/* DELETE BUTTON */}
                          <button 
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            onClick={() => openDeleteModal(user._id)}
                          >
                            <FaTrash size={14} />
                          </button>

                          {/* BLOCK BUTTON */}
                          <button 
                            className={`p-3 rounded-xl transition-all shadow-sm ${
                                user.status === 'active' 
                                ? 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white' 
                                : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
                            }`}
                            onClick={() => handleBlock(user._id, user.status)}
                          >
                            {user.status === 'active' ? <FaLock size={14} /> : <FaUnlock size={14} />}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <span className="text-2xl font-bold">⚠️</span>
              <h3 className="text-xl font-bold">Delete User?</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              This action will permanently remove the user and block their managed rooms. Please state the reason:
            </p>
            
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
              rows="3"
              placeholder="E.g., Repeated spamming, offensive behavior..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />

            {/* Suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => setDeleteReason(reason)}
                  className="text-[11px] px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all border border-gray-200 hover:border-gray-300"
                >
                  + {reason}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;