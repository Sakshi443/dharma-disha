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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleSelect = (t) => {
    setSelected(t);
    setDetailOpen(true);
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // auth state listener will update user
    } catch (err) {
      console.error('Sign in error', err);
      alert('Sign in failed: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Temple Discovery</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input placeholder="Filter by city (e.g., Pune)" value={cityFilter} onChange={e => setCityFilter(e.target.value)} />
          <button onClick={() => setAdminOpen(true)}>Admin</button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={user.photoURL} alt="avatar" style={{ width:28, height:28, borderRadius:14 }} />
              <span style={{ color: '#fff', fontSize: 14 }}>{user.displayName}</span>
              <button onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <button onClick={handleSignIn}>Sign in (Google)</button>
          )}
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
      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} user={user} />
    </div>
  );
}
