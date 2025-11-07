// src/components/MapView.jsx
import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '70vh' };
const DEFAULT_CENTER = { lat: 19.075983, lng: 72.877655 }; // Mumbai

export default function MapView({ temples = [], onSelectTemple }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [active, setActive] = useState(null);

  const handleMarkerClick = (t) => {
    setActive(t);
    if (onSelectTemple) onSelectTemple(t);
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  const center = temples.length ? temples[0].location : DEFAULT_CENTER;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={10} center={center}>
      {temples.map((t) => (
        <React.Fragment key={t.id}>
          <Marker position={t.location} onClick={() => handleMarkerClick(t)} />
          {/* Render sub-temples as smaller markers */}
          {Array.isArray(t.sub_temples) && t.sub_temples.map((s, idx) => (
            <Marker
              key={`${t.id}-sub-${idx}`}
              position={s.location}
              onClick={() => handleMarkerClick({ ...s, parent: t })}
              // Optionally use custom icon for sub-temples
            />
          ))}
        </React.Fragment>
      ))}

      {active && (
        <InfoWindow position={active.location || active.parent?.location} onCloseClick={() => setActive(null)}>
          <div style={{ maxWidth: 260 }}>
            <h3 style={{ margin: '4px 0' }}>{active.name}</h3>
            <p style={{ fontSize: 13, margin: '6px 0' }}>{(active.description || '').slice(0, 160)}</p>
            <button className="small" onClick={() => onSelectTemple(active)}>View Details</button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
