import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import USER_API from '../../api/USER_API';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await USER_API.get('/notifications');
        setNotifications(res.data);
        // mark as read
        await USER_API.patch('/notifications/markRead');
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
  }, []);
  const navigate = useNavigate()

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No notifications yet
          </div>
        ) : (
          notifications.map((note) => (
            <div 
              key={note._id} 
              onClick={() => navigate(`/tripRoom/${note.roomId}`)}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow ${
                note.isRead 
                  ? 'bg-white' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <p className="text-sm text-gray-800">{note.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage