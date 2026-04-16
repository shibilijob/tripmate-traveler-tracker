import React from "react";
import { FaBed, FaUsers, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import API from "../api/AUTH_API";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch()

  const handleLogout =async () => {
      await API.post('/logout', {}, { withCredentials: true })
      dispatch(logout())
      navigate('/login');
      // window.location.reload();
  }

  const menuItems = [
    { name: "Dashboard", icon: <FaChartLine />, path: "/admin" },
    { name: "Manage Rooms", icon: <FaBed />, path: "/admin/roomsList" },
    { name: "Users", icon: <FaUsers />, path: "/admin/users" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-[#11889c] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/10">
          tripMate
          <span className="text-sm block opacity-70">Admin Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="p-6 flex items-center gap-2 hover:bg-red-600 border-t border-white/10"
        >
          <FaSignOutAlt /> Exit
        </button>
      </aside>

      {/* Dynamic Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;