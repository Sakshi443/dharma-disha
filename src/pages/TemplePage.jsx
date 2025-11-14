// src/pages/TemplePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function TemplePage() {
  const { id } = useParams();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await getDoc(doc(db, 'temples', id));
        if (d.exists()) setTemple({ id: d.id, ...d.data() });
        else setTemple(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!temple) return <div>Temple not found.</div>;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/">← Back to map</Link>
      <h1>{temple.name}</h1>
      <p><strong>Address/City:</strong> {temple.city}</p>
      <p><strong>About (Sthana):</strong> {temple.sthana}</p>
      <p><strong>Leela:</strong> {temple.leela}</p>
      <p>{temple.description}</p>

      {temple.images && temple.images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {temple.images.map((u, i) => <img key={i} src={u} alt={`${temple.name}-${i}`} style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 8 }} />)}
        </div>
      )}

      {Array.isArray(temple.sub_temples) && temple.sub_temples.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Sub-temples</h3>
          <ul>
            {temple.sub_temples.map((s, idx) => (
              <li key={idx}>
                <strong>{s.name}</strong> — {s.description} &nbsp;
                {/* If you stored sub-temples as nested objects only, we navigate to parent temple page (this page) */}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
