// src/components/MapView.jsx
import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '70vh' };
const DEFAULT_CENTER = { lat: 19.075983, lng: 72.877655 };

export default function MapView({ temples = [] }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  if (!isLoaded) return <div>Loading map...</div>;

  // helper to get coords from doc (supports both styles)
  const getCoords = (t) => {
    if (!t) return null;
    const lat = Number(t.latitude ?? t.location?.lat ?? t.lat ?? t.location?.latitude);
    const lng = Number(t.longitude ?? t.location?.lng ?? t.lng ?? t.location?.longitude);
    if (!lat || !lng) return null;
    return { lat, lng };
  };

  const center = temples.length ? getCoords(temples[0]) ?? DEFAULT_CENTER : DEFAULT_CENTER;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={8} center={center}>
      {temples.map((t) => {
        const pos = getCoords(t);
        if (!pos) return null;
        return (
          <React.Fragment key={t.id}>
            <Marker position={pos} onClick={() => setActive(t)} />
            {/* render sub-temples */}
            {Array.isArray(t.sub_temples) && t.sub_temples.map((s, idx) => {
              const spos = getCoords(s);
              if (!spos) return null;
              return <Marker key={`${t.id}-sub-${idx}`} position={spos} onClick={() => setActive({ ...s, parentId: t.id })} icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }} />;
            })}
          </React.Fragment>
        );
      })}

      {active && (
        <InfoWindow
          position={getCoords(active) ?? getCoords(active.parent) ?? DEFAULT_CENTER}
          onCloseClick={() => setActive(null)}
        >
          <div style={{ maxWidth: 260 }}>
            <h3>{active.name}</h3>
            <p style={{ fontSize: 13 }}>{active.description?.slice(0, 140)}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => {
                setActive(null);
                // navigate to temple detail page
                // if this item is a sub-temple with parentId prop, you'll want to route differently
                const id = active.id ?? active.parentId ?? '';
                // If active has id, it's a main temple doc; for sub-temples (embedded) we should navigate to parent temple page
                if (active.id) navigate(`/temple/${active.id}`);
                else if (active.parentId) navigate(`/temple/${active.parentId}`);
                else alert('Cannot open details for this item.');
              }}>Open Page</button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
