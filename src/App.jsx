// src/App.jsx
import React, { useEffect, useState } from 'react';
import MapView from './components/MapView';
import TempleList from './components/TempleList';
import TempleDetailModal from './components/TempleDetailModal';
import AdminModal from './components/AdminModal';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth, googleProvider } from './services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

export default function App() {
  const [temples, setTemples] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const q = cityFilter.trim()
      ? query(collection(db, 'temples'), where('city', '==', cityFilter))
      : collection(db, 'temples');

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTemples(arr);
    }, (err) => console.error(err));

    return () => unsub();
  }, [cityFilter]);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleSelect = (t) => { setSelected(t); setDetailOpen(true); };

  const signIn = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); alert(e.message); }
  };
  const signOutUser = async () => { try { await signOut(auth); } catch (e) {console.error(e);} };

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>DharmaDisha</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Filter by city" value={cityFilter} onChange={e => setCityFilter(e.target.value)} />
          <button onClick={() => setAdminOpen(true)}>Admin</button>
          {user ? (
            <>
              <img src={user.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: 14 }} />
              <span style={{ color: '#fff' }}>{user.displayName}</span>
              <button onClick={signOutUser}>Sign out</button>
            </>
          ) : (
            <button onClick={signIn}>Sign in (Google)</button>
          )}
        </div>
      </header>

      <main>
        <div className="map-area">
          <MapView temples={temples} />
        </div>

        <aside className="sidebar">
          <h2>Temples</h2>
          <TempleList temples={temples} onSelect={handleSelect} />
        </aside>
      </main>

      <TempleDetailModal temple={selected} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} user={user} />
    </div>
  );
}
