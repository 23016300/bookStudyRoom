import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [bookingData, setBookingData] = useState({
    room_id: '',
    user_name: '',
    start_time: '',
    end_time: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch rooms and bookings on component mount
  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      await axios.post('http://localhost:5000/add-room', { 
        name: newRoomName 
      });
      setNewRoomName('');
      fetchRooms();
      alert('Room added successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add room');
    }
  };

  const handleRemoveRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to remove this room?")) {
      try {
        await axios.delete(`http://localhost:5000/rooms/${roomId}`);
        fetchRooms();
        alert('Room removed successfully!');
      } catch (error) {
        alert('Failed to remove room');
      }
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingData.room_id || !bookingData.user_name || 
        !bookingData.start_time || !bookingData.end_time) {
      alert('Please fill all booking fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/book-room', bookingData);
      alert('Booking successful!');
      
      // Reset form and refresh data
      setBookingData({
        room_id: '',
        user_name: '',
        start_time: '',
        end_time: ''
      });
      
      fetchRooms(); // Refresh rooms to update booking status
      fetchBookings(); // Refresh bookings list
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Booking failed';
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
        fetchRooms(); // Refresh rooms to update booking status
        fetchBookings(); // Refresh bookings list
        alert('Booking cancelled successfully!');
      } catch (error) {
        alert('Failed to delete booking');
      }
    }
  };

  // Format time for display
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      {/* Header with book symbol */}
      <div className="header">
        <h1>📚 Univen StudySpot Booking by group B(group leader Nkhelebeni lorrick)</h1>
      </div>
      
      {/* Manage Rooms Section */}
      <section className="section">
        <h2>Manage Rooms</h2>
        <div className="form-group">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter new room name"
          />
          <button onClick={handleAddRoom}>
            Add Room
          </button>
        </div>

        <h3>Available Rooms</h3>
        <ul className="room-list">
          {rooms.map(room => (
            <li key={room.id} className={room.is_booked ? 'booked' : ''}>
              <div className="room-header">
                <span className="room-name">
                  {room.name}
                  {room.is_booked && <span className="booked-badge">Booked</span>}
                </span>
                <button 
                  onClick={() => handleRemoveRoom(room.id)}
                  className="remove-btn"
                  title="Remove Room"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Book a Room Section */}
      <section className="section">
        <h2>Book a Room</h2>
        <form onSubmit={handleBooking}>
          <div className="form-group">
            <select
              value={bookingData.room_id}
              onChange={(e) => setBookingData({...bookingData, room_id: e.target.value})}
              required
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id} disabled={room.is_booked}>
                  {room.name} {room.is_booked ? '(Currently Booked)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Your Full Name"
              value={bookingData.user_name}
              onChange={(e) => setBookingData({...bookingData, user_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Start Time (Library hours: 8:00 AM - 10:00 PM):</label>
            <input
              type="datetime-local"
              value={bookingData.start_time}
              onChange={(e) => setBookingData({...bookingData, start_time: e.target.value})}
              required
              min={`${new Date().toISOString().split('T')[0]}T08:00`}
            />
          </div>
          
          <div className="form-group">
            <label>End Time (Library hours: 8:00 AM - 10:00 PM):</label>
            <input
              type="datetime-local"
              value={bookingData.end_time}
              onChange={(e) => setBookingData({...bookingData, end_time: e.target.value})}
              required
              max={`${new Date().toISOString().split('T')[0]}T22:00`}
            />
          </div>
          
          <button type="submit" disabled={loading} className="book-btn">
            {loading ? '⏳ Processing...' : '📅 Book Now'}
          </button>
        </form>
      </section>

      {/* Current Bookings Section */}
      <section className="section">
        <h2>Current Bookings</h2>
        {bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h4>{booking.room_name}</h4>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="delete-btn"
                    title="Cancel Booking"
                  >
                    ❌
                  </button>
                </div>
                <div className="booking-details">
                  <p><strong>Booked by:</strong> {booking.user_name}</p>
                  <p><strong>Start:</strong> {formatTime(booking.start_time)}</p>
                  <p><strong>End:</strong> {formatTime(booking.end_time)}</p>
                  <p><strong>Booked on:</strong> {formatTime(booking.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-bookings">No bookings yet. Be the first to book a room!</p>
        )}
      </section>
    </div>
  );
}

export default App;