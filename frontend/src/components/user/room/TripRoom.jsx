import React, { useState, useEffect, useRef } from 'react';
import { 
  FaChevronLeft, FaCopy, FaUsers, FaComments, FaPhoneAlt, 
  FaExclamationTriangle, FaPaperPlane, FaTimes, FaBars, FaCog,
  FaUserPlus,
} from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";
import { getRoomById, updateRoomStatus, updateRoomVisibility, handleInviteAction } from "../../../redux/slices/roomSlice";
import { toast } from 'react-toastify';
import JoinRequestModal from './JoinRequestModel';
import InvitesTab from './InvitesTab';
import socket from '../../../socket';
import USER_API from '../../../api/USER_API';
import LiveMap from '../../map/LiveMap';

const TripRoom = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderOpen,setIsHeaderOpen] = useState(false);
  const user = useSelector((state)=>state.auth.user)
  const [tripStatus, setTripStatus] = useState('planned')

  const { roomId } = useParams();
  const dispatch = useDispatch();

  const { currentRoom, loading } = useSelector((state) => state.rooms);

  const isPrivate = currentRoom?.visibility === 'private';

  const [dismissedInviteId, setDismissedInviteId] = useState(null);
  const isLeader = currentRoom?.roomLeaderId === user?._id;
  const latestPendingInvite = currentRoom?.invites?.find(
    invite => invite.status === 'pending' && invite.userId !== dismissedInviteId
  );
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef();

  // Location 
  const [memberLocations, setMemberLocations] = useState({});
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  // invite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const onInviteAction = (targetUserId, action) => {
    if (action === 'pending') {
      // Just hide the modal locally
      setDismissedInviteId(targetUserId);
      return; 
    }

    dispatch(handleInviteAction({ roomId, targetUserId, action }))
      .unwrap()
      .then(() => {
        toast.success(`Request ${action}ed!`);
        setDismissedInviteId(null); // Reset when a real action is taken
      })
      .catch((err) => toast.error(err));
  };

  const handleToggleVisibility = async () => {
    const nextState = isPrivate ? 'public' : 'private';
    
    // Start the loading toast and save its ID to 'tid'
    const tid = toast.loading(`Setting room to ${nextState}...`);
    
    try {
      await dispatch(updateRoomVisibility({ 
        roomId, 
        visibility: nextState 
      })).unwrap();

      // 2. UPDATE the 'tid' toast into a success message
      toast.update(tid, { 
        render: `ROOM IS NOW ${nextState.toUpperCase()}`, 
        type: "success", 
        isLoading: false,
        autoClose: 2000,
        closeButton: true  
      });

    } catch (error) {
      toast.update(tid, { 
        render: error.message || "Failed to update", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000,
        closeButton: true
      });
    }
  };

  // socket 
  // join room
  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);
    }
    return () => {
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId]);

  // load chat history from db
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await USER_API.get(`/chatHistory/${roomId}`, {
        });
        
        // Access response.data.messages instead of response.data
        // Add a fallback to an empty array [] to prevent crashes
        const chatData = response.data.messages || [];
        // Format the time for the UI
        const history = chatData.map(msg => ({
          ...msg,
          id: msg._id,
          time: new Date(msg.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "delivered" // History is already delivered
        }));

        setMessages(history);
      } catch (err) {
        console.error("Could not load chat history", err);
      }
    };

    if (roomId) {
      loadHistory();
    }
  }, [roomId]);

  // recieve message
  useEffect(() => {
    socket.off("receiveMessage");

    socket.on("receiveMessage", (data) => {
      data.time = new Date(data.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === data.id);

        if (exists) {
          // just update status (✔ -> ✔✔)
          return prev.map((msg) =>
            msg.id === data.id
              ? { ...msg, status: "delivered" }
              : msg
          );
        }

        // new message
        return [...prev, data];
      });
    });

    return () => socket.off("receiveMessage");
  }, []);

  // auto scroll
  useEffect(() => {
    if (activeTab === 'chat') {
      // We use a tiny timeout to ensure the DOM has finished rendering the messages
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [messages, activeTab]);

  // send message
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const msgData = {
      id: Date.now(), // UNIQUE ID 
      roomId,
      message: input,
      sender: user?.userName || "User",
      senderId: user?._id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    socket.emit("sendMessage", msgData);

    // show instantly 
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === msgData.id);
      return exists ? prev : [...prev, msgData];
    });

    setInput("");
  };


  // location
  useEffect(() => {

    // Listen for the snapshot of all members
    socket.on("initialLocations", (locations) => {
        setMemberLocations(locations);
    });

    socket.on("locationUpdated", (data) => {
      setMemberLocations(prev => ({
        ...prev,
        [data.userId]: {
          lat: data.coords.lat,
          lng: data.coords.lng,
          speed: data.speed
        }
      }));
    });
    return () => {
      socket.off("initialLocations")
      socket.off("locationUpdated");
    }
  }, [socket]);

  // request location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setMyLocation(coords);

        // send to backend
        socket.emit("sendLocation", {
          roomId,
          coords,
          userId: user?._id,
        });

        setShowLocationPopup(false);
      },
      (err) => {
        toast.error(err.message);
        setShowLocationPopup(false);
      }
    );
  };

  // Live location
  useEffect(() => {
    if (!roomId || !user?._id) return;

    let watchId;

    // start ONLY after user allows location
    if (!showLocationPopup) {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const speed = position.coords.speed
            ? (position.coords.speed * 3.6).toFixed(1)
            : 0;

          // send live updates
          socket.emit("sendLocation", {
            roomId,
            coords,
            speed,
            userId: user?._id,
          });
        },
        (err) => {
          console.error(err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }

    // cleanup when leaving room
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [roomId, user?._id, showLocationPopup]);

  // function for send invitation by email
  const handleEmailInvite = async () => {
    if (!recipientEmail) return alert("Please enter an email address");
    setIsSending(true);
    
    try {
      await USER_API.post('/sendInvite', {
        email: recipientEmail,
        tripName: currentRoom.tripName,
        roomCode: currentRoom.roomCode
      });
      
      toast.success("Invite sent!")
      setShowInviteModal(false);
    } catch (error) {
      toast.error("Failed to send invite.");
    }
    finally {
      setIsSending(false);
    }
  };


  const handleCopyCode = () => {
    if (currentRoom?.roomCode) {
      navigator.clipboard.writeText(currentRoom.roomCode);
      
      toast.success(`Code ${currentRoom.roomCode} copied to clipboard!`, {
        position: "bottom-center",
        autoClose: 2000,
      });
    }
  }

  const handleWhatsAppInvite = () => {
  const roomName = currentRoom?.tripName || "my TripRoom";
  const roomCode = currentRoom?.roomCode;
  const joinLink = `${window.location.origin}/join/${roomCode}`;

  // Use *bold* for headers and %0A for new lines to create "blocks"
  const message = 
    `*TRIPMATE INVITATION* %0A` +
    `--------------------------------------------%0A%0A` +
    `Hey! Join My trip group %0A` +
    `'${roomName}' on TripMate. %0A%0A`+
    `*Trip Name:* ${roomName} %0A` +
    `*Room Code:* \`${roomCode}\` %0A%0A` + // Use ` ` for mono-space look (if supported)
    `*JOIN LINK:* %0A` +
    `${joinLink} %0A%0A` +
    `--------------------------------------------%0A` +
    `_Login TripMate to track locations in real-time!_`;

  const whatsappUrl = `https://wa.me/?text=${message}`;
  window.open(whatsappUrl, "_blank");
};
  useEffect(() => {
    dispatch(getRoomById(roomId));
  }, [dispatch, roomId]);

  useEffect(() => {
  if (currentRoom?.status) {
    setTripStatus(currentRoom.status);
  }
  }, [currentRoom]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white font-sans text-slate-600">
      
      {/* --- 1. TRIPMATE HEADER SECTION --- */}
      <header className="h-16 w-full bg-cyan-50 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
            {/* Hamburger Button - Now opens Header Info */}
            <button 
              onClick={() => setIsHeaderOpen(true)} 
              className="lg:hidden p-2 text-cyan-700 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer"
            >
              <FaBars size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00ff9d] rounded-full shadow-[0_0_10px_#00ff9d]"></div>
              <h1 className="text-lg md:text-xl font-black tracking-tighter text-cyan-700 uppercase italic">
                Trip<span className="text-orange-600">Room</span>
              </h1>
            </div>
        </div>

        {/* Right Side Info Area (Desktop View) */}
        <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-4 bg-[#11889c] px-4 py-2 rounded-xl border border-slate-800 text-[11px] font-bold">
              <span className="text-slate-100">Room Name: <span className="text-white ml-1 text-[10px]">{currentRoom?.tripName}</span></span>
              <div className="w-px h-3 bg-slate-700"></div>
              <span className="text-slate-100 flex items-center gap-2">
                  Code: <span className="text-white">{currentRoom?.roomCode}</span>
                  <FaCopy 
                  onClick={handleCopyCode}
                  className="text-slate-300 hover:text-[#00ff9d] cursor-pointer"/>
              </span>
            </div>

            <button 
              onClick={() => setShowInviteModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#11889c] text-white rounded-xl text-[11px] font-bold hover:bg-cyan-700 transition-all cursor-pointer active:scale-95"
              >
              + Invite
            </button>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-orange-600 text-white rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-tight shadow-lg shadow-orange-200"
            onClick={() => setShowLocationPopup(true)}
            >
              Share Location
            </button>
        </div>
      </header>

      {/* --- 2. MOBILE HEADER DRAWER (The "Menu" content) --- */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isHeaderOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-cyan-700 italic">MENU</h2>
            <button onClick={() => setIsHeaderOpen(false)} className="p-2 text-slate-400"><FaTimes size={20}/></button>
          </div>

          <div className="space-y-6">
            <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
              <p className="text-[10px] font-black text-cyan-700 uppercase mb-2 tracking-widest">Active Room</p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">{currentRoom?.tripName}</p>
              <div className="mt-3 flex items-center justify-between bg-white p-2 rounded-lg border border-cyan-100">
                <span className="text-xs font-mono font-bold text-slate-500">{currentRoom?.roomCode}</span>
                <FaCopy className="text-cyan-600 hover:text-[#00ff9d] cursor-pointer" onClick={handleCopyCode}/>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 py-4 bg-[#11889c] text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95"
           onClick={() => setShowInviteModal(true)}
            >
              + Invite Friends
            </button>
          </div>
        </div>
      </div>
      {/* --- MAIN CONTENT AREA (Map + Sidebar) --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- LEFT SECTION: THE MAP --- */}
        <div className="relative flex-1 bg-[#f0f4f8] overflow-hidden">
          <LiveMap
            members={currentRoom?.members} 
            memberLocations={memberLocations} 
            currentUser={user}
          />

          {/* Mobile Chat Trigger */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden absolute bottom-24 right-6 w-14 h-14 bg-[#11889c] text-white rounded-2xl shadow-2xl flex items-center justify-center z-400 active:scale-95"
          >
            <FaComments size={22}/>
          </button>

          {/* Voice Button */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button className="flex items-center gap-3 bg-[#11889c] text-white px-10 py-4 rounded-full shadow-2xl shadow-[#11889c]/30 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
              <FaPhoneAlt size={12}/> Join Voice
            </button>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: CHAT & MEMBERS --- */}
        <div className={`
          fixed lg:relative inset-y-0 right-0 z-[60] lg:z-10 w-full sm:w-85 bg-white border-l border-slate-100 shadow-2xl flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile Sidebar */}
          <div className="lg:hidden p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50">
            <span className="font-black text-xs uppercase tracking-widest">Room Activity</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2"><FaTimes/></button>
          </div>

          {/* Tabs */}
          <div className="flex p-5 gap-1 border-b border-slate-50">
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'members' ? 'bg-[#11889c]/10 text-[#11889c]' : 'text-slate-400'}`}>
              <FaUsers size={14}/> Members
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'chat' ? 'bg-[#11889c]/10 text-[#11889c]' : 'text-slate-400'}`}>
              <FaComments size={14}/> Chat
            </button>
            {user.role === 'roomLeader' && <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] transition-all ${activeTab === 'settings' ? 'bg-[#11889c]/10 text-[#11889c]' : 'text-slate-400'}`}>
                <FaCog size={14}/>
            </button> }
            {user.role === 'roomLeader' && <button
                onClick={() => setActiveTab('invites')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] transition-all ${activeTab === 'invites' ? 'bg-[#11889c]/10 text-[#11889c]' : 'text-slate-400'}`}>
                <FaUserPlus size={14}/>
            </button> }
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'members' && (
              <div className="space-y-6">
                
                {/* Dynamic count */}
                <p className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">
                  Online Tracker ({currentRoom?.members?.length || 0})
                </p>

                {currentRoom?.members?.map((member) => {
                // Use the ID from the populated object, or fallback to the string
                const actualId = member.userId?._id || member.userId;
                // Get the speed from the memberLocations state using that ID
                const liveSpeed = memberLocations[actualId]?.speed || "0";
                // Get the color from the populated user object
                const userColor = member.color || "#11889c";

                return (
                  <div key={actualId} className="flex items-center gap-4">
                    {/* Avatar using Dynamic Color */}
                    <div 
                      style={{ backgroundColor: `${userColor}20`, color: userColor }} 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black"
                    >
                      {member.userName?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-700">{member.userName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        Current Speed : {liveSpeed} km/h
                      </p>
                    </div>
                  </div>
                );
              })}

              </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {messages.map((msg, i) => (
                      <div
                          key={i}
                          className={`p-3 rounded-xl max-w-[80%] text-xs ${
                            msg.sender === user?.userName
                              ? "bg-[#11889c] text-white ml-auto"
                              : "bg-slate-300 text-black"
                          }`}
                        >
                        <p className="text-[10px] font-bold">{msg.sender}</p>
                        <p>{msg.message}</p>
                        {/* 👇 TIME + TICK */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                          <span>{msg.time}</span>

                          {msg.sender === user?.userName && (
                            <span>✔</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef}></div>
                  </div>


                  {/* Chat Input */}
                  <div className="mt-auto relative pt-4">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        placeholder="Type message..."
                        className="w-full bg-slate-50 border border-cyan-400 rounded-2xl pl-4 pr-12 py-4 text-xs"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="flex justify-center items-center absolute right-2 top-[22px] w-10 h-10 bg-[#11889c] text-white rounded-xl cursor-pointer"
                      >
                        <FaPaperPlane size={12} />
                      </button>
                  </div>
                </div>
            )}

            {activeTab === 'settings' && user.role === 'roomLeader' && (
            <div className="space-y-6">
                <header>
                <p className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Room Settings</p>
                </header>

                <div className="space-y-4">
                {/* --- Trip Status Section --- */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Trip Status</span>
                    <span className="px-2 py-1 bg-cyan-100 text-[#11889c] text-[9px] font-black rounded-md uppercase">
                        {tripStatus}
                    </span>
                    </div>

                    <div className="flex justify-between items-center gap-1">
                    {['planned', 'active', 'completed'].map((status) => (
                        <button
                        key={status}
                        onClick={() => {
                          setTripStatus(status);
                          dispatch(updateRoomStatus({ roomId, status }));
                        }}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                            tripStatus === status 
                            ? 'bg-[#11889c] text-white border-[#11889c] shadow-md shadow-cyan-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-cyan-200'
                        }`}
                        >
                        {status}
                        </button>
                    ))}
                    </div>
                    
                    <p className="text-[8px] text-slate-400 leading-tight">
                    * Switching to <span className="font-bold">Active</span> starts location sharing for all members.
                    </p>
                </div>

                {/* --- Privacy Mode Toggle --- */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-slate-700 tracking-tight">
                      Make the room private
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {isPrivate ? "Hidden from others" : "Visible to others"}
                    </span>
                  </div>

                  {/* TOGGLE BUTTON */}
                  <button 
                    onClick={handleToggleVisibility}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out shadow-inner ${
                      isPrivate ? 'bg-[#11889c]' : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                      isPrivate ? 'translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                <footer className="pt-4">
                    <p className="text-[9px] text-slate-400 italic text-center bg-slate-50 py-2 rounded-lg">
                    These controls are exclusive to the Room Leader
                    </p>
                </footer>
                </div>
              </div>
            )}

            {activeTab === 'invites' && (
            <InvitesTab
              invites={currentRoom?.invites} 
              onAction={onInviteAction} 
            />
            )}
          </div>

          {/* SOS Section */}
          <div className="p-6 border-t border-slate-50 bg-slate-50/50">
            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-100 animate-pulse">
              <FaExclamationTriangle size={14}/> Emergency SOS
            </button>
          </div>
        </div>
      </div>

      {/* --- JOIN REQUEST MODAL (Only for Leader) --- */}
      {isLeader && latestPendingInvite && (
        <JoinRequestModal
          invite={latestPendingInvite}
          room={currentRoom}
          onAction={onInviteAction}
          isProcessing={loading}
        />
      )}

      {showLocationPopup && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-2xl text-center w-[300px] shadow-2xl">
          <h2 className="font-bold text-lg mb-2">Location Access</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share your live location with room members?
          </p>

          <button
            onClick={requestLocation}
            className="bg-[#11889c] text-white px-4 py-2 rounded-xl m-2"
          >
            Allow
          </button>

          <button
            onClick={() => setShowLocationPopup(false)}
            className="bg-gray-300 px-4 py-2 rounded-xl m-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* Invite Modal */}
    {showInviteModal && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-cyan-100 animate-in fade-in zoom-in duration-200">
          
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Share Invite</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select your squad's channel</p>
          </div>

          <div className="flex flex-col gap-4">

            {/* WhatsApp Option */}
            <button 
              onClick={() => { handleWhatsAppInvite(); setShowInviteModal(false); }}
              className="flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-100 rounded-2xl transition-all active:scale-95 group"
            >
              <div className="bg-green-500 p-3 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-800 uppercase">WhatsApp</span>
                <span className="block text-[10px] text-green-600 font-bold uppercase">Send to Squad</span>
              </div>
            </button>

            {/* Email Option */}

            {/* DIVIDER */}
            <div className="flex items-center my-3">
                <div className="flex-1 h-[1px] bg-black/30"></div>
                <span className="text-sm text-black/70"> or </span>
                <div className="flex-1 h-[1px] bg-black/30"></div>
            </div>

            <div className="mb-4">
              <input 
                type="email" 
                placeholder="Enter friend's email"
                className="w-full p-3 border-2 border-cyan-100 rounded-2xl outline-none focus:border-cyan-600 text-sm"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <button 
              onClick={handleEmailInvite}
              // 1. Prevent clicking while sending
              disabled={isSending} 
              className={`flex items-center gap-4 p-4 w-full rounded-2xl transition-all border-2 
                ${isSending 
                  ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70' 
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100 active:scale-95 group'
                }`}
            >
              <div className={`p-3 rounded-xl text-white shadow-lg transition-transform 
                ${isSending ? 'bg-slate-400 animate-pulse' : 'bg-blue-500 group-hover:-rotate-12'}`}
              >
                {/* 2. Dynamic Icon: show a spinner or the mail icon */}
                {isSending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <path d="m22 6-10 7L2 6"/>
                  </svg>
                )}
              </div>

            <div className="text-left">
              {/* 3. Dynamic Text */}
              <span className="block font-black text-slate-800 uppercase">
                {isSending ? 'Sending Invite...' : 'Send Email'}
              </span>
              <span className="block text-[10px] text-blue-600 font-bold uppercase">
                {isSending ? 'Please wait a moment' : 'Direct to inbox'}
              </span>
            </div>
          </button>

            {/* Cancel */}
            <button 
              onClick={() => setShowInviteModal(false)}
              className="mt-2 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors"
            >
              Nevermind, Go Back
            </button>
          </div>
        </div>
      </div>
    )}
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55]"/>}
    </div>
  );
};

export default TripRoom;