import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequestItems = () => {
  const [itemId, setItemId] = useState(''); // Item ID
  const [quantity, setQuantity] = useState(''); // Quantity
  const [requests, setRequests] = useState([]); // User's past requests
  const [loading, setLoading] = useState(true); // Loader state
  const [message, setMessage] = useState(''); // Success/Error message

  // Fetch user requests on load
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    axios.get('http://localhost:5000/api/user/requests', { withCredentials: true })
      .then(res => {
        setRequests(res.data.requests);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  };

  // Handle new item request
  const handleRequestSubmit = (e) => {
    e.preventDefault();

    if (!itemId || !quantity) {
      setMessage('Please fill all fields.');
      return;
    }

    axios.post('http://localhost:5000/api/user/request-item', {
      item_id: parseInt(itemId), // Ensure number
      quantity: parseInt(quantity)
    }, { withCredentials: true })
      .then(res => {
        setMessage('Request submitted successfully!');
        setItemId('');
        setQuantity('');
        fetchRequests(); // Refresh list
      })
      .catch(err => {
        console.error("Error submitting request:", err);
        setMessage('Failed to submit request.');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 Request Items</h2>

      {/* Request Form */}
      <form onSubmit={handleRequestSubmit} style={styles.form}>
        <input
          type="number"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Request Item</button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      {/* Display Past Requests */}
      <h3 style={styles.subheading}>Your Requests</h3>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Requested On</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.item_id}</td>
                <td>{req.quantity}</td>
                <td style={req.status === 'Pending' ? styles.pending : styles.approved}>{req.status}</td>
                <td>{new Date(req.request_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.noData}>No requests found.</p>
      )}
    </div>
  );
};

export default RequestItems;

// ✅ CSS Styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '30px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
    fontSize: '28px',
  },
  subheading: {
    marginTop: '30px',
    color: '#444',
    fontSize: '22px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    flex: '1',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  },
  message: {
    color: 'green',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  noData: {
    color: '#777',
    textAlign: 'center',
  },
  pending: {
    color: 'orange',
    fontWeight: 'bold',
  },
  approved: {
    color: 'green',
    fontWeight: 'bold',
  },
  'table th, table td': {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'center',
  },
};
