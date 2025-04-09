import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/user/inventory', { withCredentials: true })
      .then(res => {
        console.log('Inventory data:', res.data);
        setInventory(res.data.inventory || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching inventory:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 Inventory Table</h2>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <>
          {Array.isArray(inventory) && inventory.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>S.No</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{item.description}</td>
                    <td style={styles.td}>{item.comp_code}</td>
                    <td style={styles.td}>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noData}>No items available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ViewInventory;

const styles = {
  container: {
    maxWidth: '1000px',
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
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f2f2f2',
    color: '#333',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
  },
  noData: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#888',
  },
};
