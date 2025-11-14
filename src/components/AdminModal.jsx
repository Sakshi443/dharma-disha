// src/components/AdminModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import Papa from 'papaparse';

Modal.setAppElement('#root');

function emptySub() {
  return { name: '', description: '', location: { lat: '', lng: '' }, images: [] };
}

export default function AdminModal({ isOpen, onClose, user }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState(null);
  const [subTemples, setSubTemples] = useState([emptySub()]);
  const [saving, setSaving] = useState(false);
  const [csvProcessing, setCsvProcessing] = useState(false);

  useEffect(() => {
    // reset when opened
    if (!isOpen) {
      setName(''); setCity(''); setLat(''); setLng(''); setDescription(''); setFiles(null);
      setSubTemples([emptySub()]);
    }
  }, [isOpen]);

  const handleFiles = (e) => setFiles(e.target.files);

  const uploadImages = async (files, templeId, folder = '') => {
    if (!files || files.length === 0) return [];
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `temple-images/${templeId}/${folder}${file.name}`;
      const ref = sref(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      urls.push(url);
    }
    return urls;
  };

  const handleAddSub = () => setSubTemples(prev => [...prev, emptySub()]);
  const handleRemoveSub = (idx) => setSubTemples(prev => prev.filter((_, i) => i !== idx));
  const handleSubChange = (idx, field, value) => {
    setSubTemples(prev => {
      const next = [...prev];
      if (field === 'name' || field === 'description') next[idx][field] = value;
      else if (field === 'lat' || field === 'lng') next[idx].location[field === 'lat' ? 'lat' : 'lng'] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert('You must be signed in to add temples'); return; }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'temples'), {
        name,
        city,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        description,
        images: [],
        sub_temples: subTemples.map(s => ({
          name: s.name,
          description: s.description,
          location: { lat: parseFloat(s.location.lat || 0), lng: parseFloat(s.location.lng || 0) },
          images: []
        })),
        createdBy: { uid: user.uid, email: user.email, name: user.displayName },
        createdAt: Date.now()
      });

      // upload main images
      const mainUrls = await uploadImages(files, docRef.id, 'main/');
      if (mainUrls.length) {
        await updateDoc(doc(db, 'temples', docRef.id), { images: mainUrls });
      }

      // Note: uploading sub-temple images via Admin UI would need file inputs per sub-temple.
      // For now, sub-temple images are empty; can extend later.

      alert('Temple added successfully');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error adding temple: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------- CSV Import in-browser (assumes columns: name,city,lat,lng,description,images,sub_temples)
  // - images: optional semicolon-separated URLs or file names (file upload for images not supported in CSV)
  // - sub_temples: optional JSON string array: [{"name":"x","lat":..,"lng":..,"description":".."}]
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        try {
          for (const r of rows) {
            // parse fields
            const docData = {
              name: r.name || '',
              city: r.city || '',
              location: { lat: parseFloat(r.lat || 0), lng: parseFloat(r.lng || 0) },
              description: r.description || '',
              images: [],
              sub_temples: []
            };

            // images field: semicolon-separated URLs
            if (r.images) {
              const imgs = r.images.split(';').map(s => s.trim()).filter(Boolean);
              docData.images = imgs;
            }

            // sub_temples: if provided as JSON string
            if (r.sub_temples) {
              try {
                const subs = JSON.parse(r.sub_temples);
                if (Array.isArray(subs)) {
                  docData.sub_temples = subs.map(s => ({
                    name: s.name || '',
                    description: s.description || '',
                    location: { lat: parseFloat(s.lat || s.location?.lat || 0), lng: parseFloat(s.lng || s.location?.lng || 0) },
                    images: s.images || []
                  }));
                }
              } catch (err) {
                console.warn('sub_temples JSON parse failed for row', r, err);
              }
            }

            // add to Firestore
            await addDoc(collection(db, 'temples'), docData);
          }
          alert('CSV import complete');
        } catch (err) {
          console.error('CSV import error', err);
          alert('CSV import failed: ' + err.message);
        } finally {
          setCsvProcessing(false);
        }
      },
      error: (err) => {
        console.error('CSV parse error', err);
        alert('CSV parse error: ' + err.message);
        setCsvProcessing(false);
      }
    });
  };

  // -------- UI (protected: require user)
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Admin — Add Temple</h2>
        <button onClick={onClose}>Close</button>
      </div>

      {!user ? (
        <div style={{ marginTop: 12 }}>
          <p>You must be signed in with Google to add or edit temples.</p>
          <p>Please sign in using the Sign in (Google) button in the top bar.</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <label>Name
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </label>

            <label>City
              <input type="text" value={city} onChange={e => setCity(e.target.value)} required />
            </label>

            <label>Latitude
              <input type="number" value={lat} onChange={e => setLat(e.target.value)} required />
            </label>

            <label>Longitude
              <input type="number" value={lng} onChange={e => setLng(e.target.value)} required />
            </label>

            <label>Description
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </label>

            <label>Images (upload)
              <input type="file" multiple accept="image/*" onChange={handleFiles} />
              <small>These will be uploaded to Firebase Storage.</small>
            </label>

            <h3>Sub-temples</h3>
            {subTemples.map((s, idx) => (
              <div key={idx} style={{ border: '1px dashed #ddd', padding: 8, marginBottom: 8, borderRadius: 6 }}>
                <label>Sub-temple Name
                  <input type="text" value={s.name} onChange={e => handleSubChange(idx, 'name', e.target.value)} />
                </label>
                <label>Latitude
                  <input type="number" value={s.location.lat} onChange={e => handleSubChange(idx, 'lat', e.target.value)} />
                </label>
                <label>Longitude
                  <input type="number" value={s.location.lng} onChange={e => handleSubChange(idx, 'lng', e.target.value)} />
                </label>
                <label>Description
                  <input type="text" value={s.description} onChange={e => handleSubChange(idx, 'description', e.target.value)} />
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button type="button" onClick={() => handleRemoveSub(idx)}>Remove</button>
                  {idx === subTemples.length - 1 && <button type="button" onClick={handleAddSub}>Add another sub-temple</button>}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 12 }}>
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Temple'}</button>
            </div>
          </form>

          <hr style={{ margin: '12px 0' }} />

          <div>
            <h3>CSV Bulk Import</h3>
            <p style={{ fontSize: 13 }}>Upload a CSV with header row. Supported columns: <code>name,city,lat,lng,description,images,sub_temples</code>.</p>
            <p style={{ fontSize: 13 }}>Images should be semicolon-separated URLs. <code>sub_temples</code> should be a JSON string (array) with keys name,lat,lng,description,images (images array or semicolon string).</p>
            <input type="file" accept=".csv" onChange={handleCsvUpload} />
            {csvProcessing && <div>Processing CSV...</div>}
          </div>
        </>
      )}
    </Modal>
  );
}
