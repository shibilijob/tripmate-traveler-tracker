import react, { useState } from "react";

function LocationComponent() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      }
    );
  };

  return (
    <div>
      <button onClick={requestLocation}>
        Get My Location
      </button>

      {location && (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}

      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default LocationComponent;