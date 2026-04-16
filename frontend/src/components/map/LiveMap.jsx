import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster"
import { FaLocationArrow, FaLayerGroup } from 'react-icons/fa';

// 1. to get My Location
const LocationButton = ({ coords }) => {
  const map = useMap();
  const handleRecenter = () => {
    const lat = coords?.lat || coords?.coords?.lat;
    const lng = coords?.lng || coords?.coords?.lng;
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { animate: true });
    }
  };

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "30px", marginRight: "10px", zIndex: 400 }}>
      <button 
        onClick={handleRecenter}
        className="p-3 bg-white text-cyan-700 rounded-full shadow-lg hover:bg-cyan-50 cursor-pointer pointer-events-auto border-2 border-white transition-all active:scale-90 flex items-center justify-center"
        title="Find My Location"
      >
        <FaLocationArrow size={18} />
      </button>
    </div>
  );
};

// Custom Icon Function
const createMemberIcon = (userName, color = "#11889c") => {
  const initial = userName?.charAt(0).toUpperCase() || "?";
  return L.divIcon({
    className: "custom-member-marker",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 35px; height: 35px; 
          background-color: ${color}; 
          border: 3px solid white; 
          border-radius: 50%; 
          display: flex; justify-content: center; align-items: center; 
          color: white; font-weight: bold; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          font-family: sans-serif;">
          ${initial}
        </div>
        <div style="
          margin-top: 4px; padding: 2px 8px; 
          background: white; border-radius: 4px; 
          font-size: 10px; font-weight: bold; 
          border: 1px solid #eee; white-space: nowrap;">
          ${userName}
        </div>
      </div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });
};

const LiveMap = ({ members = [], memberLocations = {}, currentUser }) => {
  const myLoc = memberLocations[currentUser?._id];
  
  

  // 2. Map Type
  const [mapUrl, setMapUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  const [showMapSelector, setShowMapSelector] = useState(false);

  const mapOptions = [
    { name: 'Roads', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' }
  ];

  const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="background-color: #11889c; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 15px rgba(17, 136, 156, 0.5);">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
      
      {/* --- Map Type Selector Button --- */}
      <div className="absolute top-22 left-2 z-[100]">
        <button 
          onClick={() => setShowMapSelector(!showMapSelector)}
          className="p-3 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200"
        >
          <FaLayerGroup size={18} />
        </button>

        {showMapSelector && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">
            {mapOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => { setMapUrl(opt.url); setShowMapSelector(false); }}
                className={`w-full px-4 py-3 text-xs font-bold text-left border-b border-slate-50 last:border-0 hover:bg-cyan-50 ${mapUrl === opt.url ? 'text-cyan-600 bg-cyan-50' : 'text-slate-600'}`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={[10.8505, 76.2711]} 
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <ZoomControl position="topleft" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={mapUrl} 
        />

        {/* My Location */}
        <LocationButton coords={myLoc} />

        <MarkerClusterGroup 
          chunkedLoading 
          iconCreateFunction={createClusterCustomIcon}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
        >
          {members.map((member) => {
            const loc = memberLocations[member.userId._id || member.userId];
            if (!loc) return null;

            const lat = loc.lat || loc.coords?.lat;
            const lng = loc.lng || loc.coords?.lng;

            if (typeof lat !== 'number' || typeof lng !== 'number') return null;
            const userColor = member.color || "#11889c";

            return (
              <Marker
                key={member.userId._id || member.userId}
                position={[lat, lng]}
                icon={createMemberIcon(member.userName, userColor)}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-bold text-slate-800 border-b pb-1 mb-1">{member.userName}</p>
                    <p className="text-cyan-600 font-semibold italic">Speed: {loc.speed || 0} km/h</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default LiveMap;