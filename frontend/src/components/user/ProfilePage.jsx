import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaMapMarkedAlt, FaShieldAlt, FaHistory, FaMobileAlt, 
  FaBatteryFull, FaUserEdit, FaExternalLinkAlt, FaSignOutAlt,
  FaCalendarAlt, FaRunning, FaCheckCircle, FaDoorOpen 
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import USER_API from '../../api/USER_API';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import AUTH_API from '../../api/AUTH_API';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await USER_API.get('/myProfile'); 
        setUser(data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        // if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await AUTH_API.post('/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleIconColor = async (e) => {
  const newColor = e.target.value;
  
  // 1. Update local state immediately so the Avatar letter changes color
  setUser((prev) => ({ ...prev, color: newColor }));

  try {
    // 2. Update the Backend
    await USER_API.patch('/updateProfile', { color: newColor });
    console.log("Color updated successfully:", newColor);
  } catch (error) {
    console.error("Failed to save color to database:", error);
  
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50">
      <div className="animate-bounce font-black text-cyan-700">LOADING PROFILE...</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cyan-50 p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-2xl font-black text-slate-700 tracking-tighter uppercase">
            TripMate <span className="text-orange-600 italic">Profile</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Identity Card (Sidebar) */}
          <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-cyan-100 flex flex-col items-center">
              <div className="relative">
                <div 
                  style={{ backgroundColor: user.color || '#11889c' }} // Fallback if user.color is missing
                  className="rounded-full border-4 border-white p-1 w-36 h-36 object-cover shadow-xl flex items-center justify-center font-black"
                >
                  <span className="text-white text-7xl font-sans tracking-tighter uppercase">
                    {user.userName ? user.userName.charAt(0) : 'U'}
                  </span>
                </div>
                <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white">
                  ONLINE
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-800">{user.userName}</h2>
              <p className="text-orange-600 font-black text-[10px] tracking-[0.3em] mt-1 uppercase">
                {user.role || 'MEMBER'}
              </p>
              
              <div className="mt-8 flex flex-col gap-2 w-full relative">
                {/* The Visual Button */}
                <button 
                  className="flex items-center justify-center gap-3 py-3 text-white bg-[#11889c] hover:bg-[#085360] rounded-2xl font-bold transition-all active:scale-95 shadow-lg brightness-110 hover:brightness-100 w-full"
                >
                  <FaUserEdit size={14}/> SELECT FAVORITE COLOR
                </button>

                {/* The Actual Hidden Picker Overlay */}
                <input 
                  type="color" 
                  value={user.color || '#11889c'}
                  onChange={handleIconColor}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Choose your map marker color"
                />
                
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter mt-1">
                  Click to change your map marker color
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-cyan-100">
              <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-4 text-center">Safety Protocol</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-cyan-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Email ID</p>
                <p className="text-sm font-black text-slate-700 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Primary Metrics (Flex Layout) */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-gradient-to-br from-[#11889c] to-slate-950 p-6 rounded-3xl text-white shadow-2xl flex flex-col justify-between min-h-[140px]">
                <FaDoorOpen size={24} className="text-orange-400"/>
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Total Rooms</p>
                  <p className="text-3xl font-black italic">{user.totalRooms || 0}</p>
                </div>
              </div>

              <div className="flex-1 bg-white border-2 border-cyan-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px]">
                <FaMapMarkedAlt size={24} className="text-red-500"/>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Distance</p>
                  <p className="text-3xl font-black text-slate-800">{user.totalDistance || 0}<span className="text-xs ml-1 font-normal opacity-50">KM</span></p>
                </div>
              </div>

              <div className="flex-1 bg-white border-2 border-cyan-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px]">
                <FaShieldAlt size={24} className="text-blue-600"/>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Trips</p>
                  <p className="text-3xl font-black text-slate-800">{user.totalRooms || 0}</p>
                </div>
              </div>
            </div>

            {/* Trip Lifecycle Status (Flex Layout) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-cyan-100">
              <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-6">Trip Status</h3>
              <div className="flex flex-row gap-3">
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <FaCalendarAlt className="text-orange-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800">{user.plannedTrips || 0}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Planned</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <FaRunning className="text-blue-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800">{user.activeTrips || 0}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Active</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border border-green-100">
                  <FaCheckCircle className="text-green-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800">{user.completedTrips || 0}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Done</span>
                </div>
              </div>
            </div>

            {/* Room History & Account Info */}
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-cyan-100">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-6 flex justify-between items-center">
                  Recent Activity <FaHistory />
                </h3>
                <div className="flex flex-col gap-3">
                  {user.recentRooms && user.recentRooms.length > 0 ? (
                    user.recentRooms.map((room, idx) => (
                      <div key={idx} className="p-4 bg-cyan-50 rounded-2xl flex justify-between items-center border border-cyan-100 hover:bg-slate-100 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-black text-slate-800">{room.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{room.date}</p>
                        </div>
                        <FaExternalLinkAlt size={12} className="text-slate-300"/>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No recent trip history.</p>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-cyan-100 flex flex-col items-center justify-center text-center">
                <FaBatteryFull size={32} className="text-green-500 mb-4"/>
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-2">Member Since</h3>
                <p className="text-xl font-black text-slate-700 uppercase">
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation / Logout */}
        <div className="flex justify-center bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-cyan-100 sticky bottom-6 mt-4 self-center px-10">
          <button 
            onClick={handleLogout}
            className='px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-90 flex items-center gap-2 text-red-600 hover:text-red-700'
          >
            Logout <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;