// src/components/TempleDetailModal.jsx
import React from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#root');

export default function TempleDetailModal({ temple, isOpen, onClose }) {
  if (!temple) return null;
  const images = temple.images || [];

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{temple.name}</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <p><strong>City:</strong> {temple.city || (temple.parent?.city || '')}</p>
      <p>{temple.description || 'No description available.'}</p>

      {images.length > 0 && (
        <div className="images-grid">
          {images.map((u, i) => <img key={i} src={u} alt={`${temple.name}-${i}`} />)}
        </div>
      )}

      {Array.isArray(temple.sub_temples) && temple.sub_temples.length > 0 && (
        <>
          <h3 style={{ marginTop: 14 }}>Sub-temples</h3>
          <ul>
            {temple.sub_temples.map((s, idx) => (
              <li key={idx}><strong>{s.name}</strong> — {s.description || '—'}</li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}
