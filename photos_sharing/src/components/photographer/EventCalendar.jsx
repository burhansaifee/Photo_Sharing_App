// src/components/photographer/EventCalendar.jsx

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../common/Spinner';
import './EventCalendar.css'; // We'll create this file for modal styling

// Setup the localizer by providing the date-fns library
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EventModal = ({ event, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(event.title || '');
  const [start, setStart] = useState(event.start ? format(event.start, "yyyy-MM-dd'T'HH:mm") : '');
  const [end, setEnd] = useState(event.end ? format(event.end, "yyyy-MM-dd'T'HH:mm") : '');
  const [notes, setNotes] = useState(event.notes || '');
  const [totalAmount, setTotalAmount] = useState(event.totalAmount || 0);
  const [paidAmount, setPaidAmount] = useState(event.paidAmount || 0);
  const [status, setStatus] = useState(event.status || 'Scheduled');

 const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...event,
      title,
      start: new Date(start),
      end: new Date(end),
      notes,
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount),
      status,
    });
  };
  
  const amountDue = totalAmount - paidAmount;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{event.id ? 'Edit Booking' : 'Add New Booking'}</h3>
        <form onSubmit={handleSubmit}>
          {/* ... (title, start, end, and notes inputs remain the same) ... */}
           <div className="form-group">
            <label>Event Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required className="form-input" />
          </div>
           <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-input" />
          </div>

          <hr />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Booking</button>
            {event.id && <button type="button" onClick={() => onDelete(event.id)} className="btn btn-danger">Delete</button>}
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function EventCalendar({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, event: null });

  // Fetch events from Firestore
  useEffect(() => {
    const q = query(collection(db, 'events'), where('photographerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start.toDate(), // Convert Firestore Timestamp to JS Date
          end: data.end.toDate(),
        };
      });
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setModalState({ isOpen: true, event: { start, end } });
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setModalState({ isOpen: true, event });
  }, []);

  const handleSaveEvent = async (eventData) => {
    const { id, title, start, end, notes } = eventData;
    const dataToSave = {
      photographerId: user.uid,
      title,
      start,
      end,
      notes,
    };

    if (id) {
      await updateDoc(doc(db, 'events', id), dataToSave);
    } else {
      await addDoc(collection(db, 'events'), { ...dataToSave, createdAt: serverTimestamp() });
    }
    setModalState({ isOpen: false, event: null });
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteDoc(doc(db, 'events', id));
      setModalState({ isOpen: false, event: null });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
       <h2 className="page-title">My Schedule</h2>
      <div className="calendar-container card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      </div>
      {modalState.isOpen && (
        <EventModal
          event={modalState.event}
          onSave={handleSaveEvent}
          onClose={() => setModalState({ isOpen: false, event: null })}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}