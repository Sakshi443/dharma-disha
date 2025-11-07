// src/App.jsx
import React, { useEffect, useState } from 'react';
import MapView from './components/MapView';
import TempleList from './components/TempleList';
import TempleDetailModal from './components/TempleDetailModal';
import AdminModal from './components/AdminModal';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './services/firebase';

export default function App() {
  const [temples, setTemples] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    let q;
    if (cityFilter && cityFilter.trim() !== '') q = query(collection(db, 'temples'), where('city', '==', cityFilter));
    else q = collection(db, 'temples');

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTemples(arr);
    }, (err) => {
      console.error('Firestore snapshot error', err);
    });

    return () => unsub();
  }, [cityFilter]);

  const handleSelect = (t) => {
    setSelected(t);
    setDetailOpen(true);
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Temple Discovery</h1>
        <div className="controls">
          <input placeholder="Filter by city (e.g., Pune)" value={cityFilter} onChange={e => setCityFilter(e.target.value)} />
          <button onClick={() => setAdminOpen(true)}>Admin</button>
        </div>
      </header>

      <main>
        <div className="map-area">
          <MapView temples={temples} onSelectTemple={handleSelect} />
        </div>

        <aside className="sidebar">
          <h2>Temples</h2>
          <TempleList temples={temples} onSelect={handleSelect} />
        </aside>
      </main>

      <TempleDetailModal temple={selected} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}
