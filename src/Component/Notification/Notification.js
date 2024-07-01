import React, { useState, useEffect } from 'react';
import './Notification.css'; // Create a CSS file for styling your notification component

const Notification = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 3000); // Hide the notification after 3 seconds
    }
  }, [message]);

  return (
    <div className={`notification ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
