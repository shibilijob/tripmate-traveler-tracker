import React, { useState, useEffect } from "react";
import { FaBed, FaUsers, FaChartLine, FaClock, FaCheckCircle, FaDoorOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ADMIN_API from "../../api/ADMIN_API";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await ADMIN_API.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Error loading dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-[#11889c]">LOADING STATS...</div>;

  const stats = [
    { id: 1, label: "Total Rooms", value: data?.totalRooms || 0, icon: <FaDoorOpen />, color: "bg-blue-500" },
    { id: 2, label: "Total Users", value: data?.totalUsers || 0, icon: <FaUsers />, color: "bg-purple-500" },
    { id: 3, label: "Planned Trips", value: data?.plannedTrips || 0, icon: <FaClock />, color: "bg-orange-500" },
    { id: 4, label: "Active Trips", value: data?.activeTrips || 0, icon: <FaChartLine />, color: "bg-green-500" },
    { id: 5, label: "Completed", value: data?.completedTrips || 0, icon: <FaCheckCircle />, color: "bg-cyan-600" },
  ];

  return (
    <div className="flex min-h-screen bg-cyan-50 rounded-xl border border-cyan-100">
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Dashboard</h1>
        </header>

        <div className="flex flex-wrap gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-[300px] flex-1 md:flex-none"
            >
              <div className={`${stat.color} text-white p-4 rounded-xl text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recently Created Rooms</h2>
            <button 
              onClick={() => navigate('roomsList')} 
              className="text-[#11889c] font-medium hover:underline text-sm"
            >
              View All Rooms
            </button>
          </div>

          {/* Recent Rooms - Flex Container */}
          <div className="flex flex-wrap gap-6">
            {data?.recentRooms?.map((room) => (
              <div 
                key={room._id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group flex-1 min-w-[300px] max-w-[400px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#11889c]/10 p-3 rounded-xl text-[#11889c] group-hover:bg-[#11889c] group-hover:text-white transition">
                    <FaBed className="text-xl" />
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold uppercase">NEW</span>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-1">{room.tripName}</h3>
                <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-tight">
                    {room.destination} • {new Date(room.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-xs text-gray-500 font-semibold">
                    Code: <span className="text-[#11889c]">{room.roomCode}</span>
                  </span>
                  <button 
                    onClick={() => navigate('roomsList')}
                    className="text-[#fb6c03] text-xs font-bold hover:underline"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;