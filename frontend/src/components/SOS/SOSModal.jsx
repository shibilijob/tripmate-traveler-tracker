import React, { useState, useEffect } from 'react';
import USER_API from '../../api/USER_API';

const SOSModal = ({ isOpen, onClose, roomId, currentUser, socket }) => {
  const [message, setMessage] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // to fetch old sos
  useEffect(() => {
    if (isOpen && roomId) {
      fetchAlerts();
    }
  }, [isOpen, roomId]);

  // to recieve new alert
  useEffect(() => {
    if (!socket) return;

    const handleReceiveSOS = (newAlert) => {
      if (newAlert.roomId === roomId) {
        setAlerts((prev) => [newAlert, ...prev]);

        setToast(`${newAlert.senderName}: ${newAlert.message}`);

        // play the siren
        const audio = new Audio('/siren.mp3');
        audio.play()
          .then(() => {
            setTimeout(() => {
              audio.pause();
              setToast(null); 
              audio.currentTime = 0;
            }, 3000);
          })
          .catch((err) => console.log("Autoplay issue:", err));
      }
    };

    socket.on('receive_sos', handleReceiveSOS);
    return () => socket.off('receive_sos', handleReceiveSOS);
  }, [socket, roomId]);

  const fetchAlerts = async () => {
    try {
      const { data } = await USER_API.get(`/sos/${roomId}`);
      setAlerts(data);
    } catch (error) {
      console.error("Failed in fetch SOS alerts", error);
    }
  };

  const handleSendSOS = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const sosData = {
        roomId,
        senderId: currentUser._id,
        senderName: currentUser.userName || currentUser.name,
        message: message,
      };
      const { data } = await USER_API.post('/sos', sosData);
      if (socket) socket.emit('send_sos', data);
      setMessage('');
      setAlerts((prev) => [data, ...prev]);
    } catch (error) {
      console.error('can not send sos data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔔 CUSTOM TOAST */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[300] animate-in slide-in-from-right duration-300">
          <div className="bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border-l-8 border-red-600 flex items-center gap-4">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Emergency Alert</p>
              <p className="text-sm font-bold truncate max-w-[200px]">{toast}</p>
            </div>
          </div>
        </div>
      )}

      {/* 📝 SOS MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border-4 border-red-600 animate-in fade-in zoom-in duration-300">
            
            {/* Header Section */}
            <div className="bg-red-600 p-5 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full animate-pulse">
                  <span className="text-xl">🚨</span>
                </div>
                <div>
                  <h2 className="font-black text-xl tracking-tighter uppercase">SOS Emergency</h2>
                  <p className="text-[10px] text-red-100 font-bold uppercase tracking-widest">Immediate Alert System</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {/* History Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Room Alerts</h3>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
                </div>
                
                <div className="max-h-52 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 opacity-30">
                      <span className="text-4xl mb-2">📡</span>
                      <p className="text-xs font-bold uppercase">System Clear - No Alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert._id} className="bg-gradient-to-r from-red-50 to-white border-l-4 border-red-600 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-black text-red-800 text-sm uppercase italic">{alert.senderName}</span>
                        </div>
                        <p className="text-gray-700 text-sm font-medium leading-relaxed italic">"{alert.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-6 w-full" />

              {/* Input Form */}
              <form onSubmit={handleSendSOS} className="space-y-4">
                <textarea
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:outline-none transition-all resize-none text-sm font-semibold"
                  placeholder="What's happening?..."
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="uppercase tracking-widest text-sm">Broadcast SOS Alert</span>
                      <span className="text-lg">📢</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSModal;