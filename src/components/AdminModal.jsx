// src/components/AdminModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';

Modal.setAppElement('#root');

export default function AdminModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFiles = (e) => setFiles(e.target.files);

  const uploadImages = async (files, templeId) => {
    if (!files || files.length === 0) return [];
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ref = sref(storage, `temple-images/${templeId}/${file.name}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'temples'), {
        name,
        city,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        description,
        images: [],
        sub_temples: []
      });

      // upload images then update the document with URLs
      const urls = await uploadImages(files, docRef.id);
      if (urls.length) {
        const templeDoc = doc(db, 'temples', docRef.id);
        await updateDoc(templeDoc, { images: urls });
      }

      // reset
      setName(''); setCity(''); setLat(''); setLng(''); setDescription(''); setFiles(null);
      onClose();
      alert('Temple added successfully');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Add Temple (Admin)</h2>
        <button onClick={onClose}>Close</button>
      </div>

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

        <label>Images
          <input type="file" multiple accept="image/*" onChange={handleFiles} />
        </label>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Temple'}</button>
        </div>
      </form>
    </Modal>
  );
}

