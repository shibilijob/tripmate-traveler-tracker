import React, { useState } from "react";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import logo from "../../assets/tripMate_logo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import API from "../../api/AUTH_API";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  // const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout =async () => {
    await API.post('/logout', {}, { withCredentials: true })
    dispatch(logout())
    setShowDropdown(false);
    navigate('/login');
    // window.location.reload();
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 relative">
      <div className="max-w-[1350px] mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            className="w-32 md:w-40 h-10 object-contain cursor-pointer"
            alt="logo"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          {["Home", "Rooms", "Features", "About"].map((item) => (
            <a key={item} href={item === "Home" ? "/" : `/${item.toLowerCase()}`} className="relative group">
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#fb6c03] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              {/* Profile Trigger */}
              <div 
                className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUserCircle className="text-2xl text-[#11889c]" />
                <span className="font-medium text-gray-700">{user.userName}</span>
              </div>

              {/* Desktop Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Invisible backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => { navigate('/UserProfile'); setShowDropdown(false); }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <FaUser className="text-[#11889c]" /> Profile
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              className="hidden md:block bg-[#11889c] hover:bg-[#0f6f80] text-white px-5 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-6 mt-2 mb-4 bg-white border border-gray-200 rounded-2xl shadow-lg p-5 flex flex-col gap-4 text-gray-700 font-medium">
          <a href="/" className="hover:text-[#fb6c03] transition">Home</a>
          <a href="/rooms" className="hover:text-[#fb6c03] transition">Rooms</a>
          <a href="/features" className="hover:text-[#fb6c03] transition">Features</a>
          <a href="/about" className="hover:text-[#fb6c03] transition">About</a>

          <div className="border-t border-gray-100 pt-4 z-[900] ">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#11889c]">
                  <FaUserCircle className="text-xl" />
                  <span>{user.userName}</span>
                </div>
                <button 
                  onClick={() => navigate('/UserProfile')}
                  className="text-left hover:text-[#fb6c03]"
                >
                  My Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-left text-red-500 flex items-center gap-2"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <button 
                className="w-full bg-[#11889c] hover:bg-[#0f6f80] text-white py-2 rounded-lg transition cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;