// src/components/TempleList.jsx
import React from 'react';

export default function TempleList({ temples = [], onSelect }) {
  if (!temples.length) return <div>No temples found.</div>;

  return (
    <ul className="temple-list">
      {temples.map(t => (
        <li className="temple-item" key={t.id} onClick={() => onSelect(t)}>
          <strong>{t.name}</strong>
          <div style={{ fontSize: 13, color: '#555' }}>{t.city}</div>
        </li>
      ))}
    </ul>
  );
}
