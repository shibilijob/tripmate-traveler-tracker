import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster"
import { FaLocationArrow, FaLayerGroup } from 'react-icons/fa';
import { MdMyLocation } from 'react-icons/md'

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
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "60px", marginRight: "30px", zIndex: 400 }}>
      <button 
        onClick={handleRecenter}
        className="p-3 bg-white text-cyan-700 rounded-full shadow-lg hover:bg-cyan-50 cursor-pointer pointer-events-auto border-2 border-white transition-all active:scale-90 flex items-center justify-center"
        title="Find My Location"
      >
        <MdMyLocation size={18} />
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
  
  // New States for Loading and Error Handling
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [mapUrl, setMapUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  const [showMapSelector, setShowMapSelector] = useState(false);

  const mapOptions = [
    { name: 'Roads', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' }
  ];

  // Function to handle the Retry/Recenter logic
  const handleRecenterOrRetry = () => {
    const lat = myLoc?.lat || myLoc?.coords?.lat;
    const lng = myLoc?.lng || myLoc?.coords?.lng;

    if (mapInstance && lat && lng) {
      mapInstance.flyTo([lat, lng], 15, { animate: true });
      setMapError(false);
    } else {
      // If map is completely broken, reload the page
      window.location.reload();
    }
  };

  const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="background-color: #11889c; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 15px rgba(17, 136, 156, 0.5);">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-slate-50">
      
      {/* --- 1. Lag Loader Overlay --- */}
      {isLoading && !mapError && (
        <div className="absolute inset-0 z-[700] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#11889c] rounded-full animate-spin"></div>
          <p className="mt-3 text-[#11889c] font-bold text-sm animate-pulse">Loading Map...</p>
        </div>
      )}

      {/* --- 2. Error/Retry Overlay --- */}
      {mapError && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center border-2 border-white">
            <p className="text-slate-600 mb-4 font-semibold">Connection issue detected</p>
            <button 
              onClick={handleRecenterOrRetry}
              className="flex items-center gap-2 px-6 py-2 bg-[#11889c] text-white rounded-full font-bold shadow-lg hover:bg-[#0e6d7d] transition-all active:scale-95 mx-auto"
            >
              <FaLocationArrow size={14} />
              Recenter & Retry
            </button>
          </div>
        </div>
      )}

      {/* --- Map Type Selector Button --- */}
      <div className="absolute top-22 left-2 z-[100]">
        <button 
          onClick={() => setShowMapSelector(!showMapSelector)}
          className="p-3 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200"
        >
          <FaLayerGroup size={18} />
        </button>

        {showMapSelector && (
          <div className="absolute left-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">
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
        // Capture map instance when ready
        whenReady={(map) => {
          setMapInstance(map.target);
          setIsLoading(false);
        }}
      >
        <ZoomControl position="topleft" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={mapUrl} 
          // Event handlers to manage loading and error states
          eventHandlers={{
            tileerror: () => {
              setMapError(true);
              setIsLoading(false);
            },
            tileloadstart: () => setIsLoading(true),
            tileload: () => {
              setIsLoading(false);
              setMapError(false);
            }
          }}
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