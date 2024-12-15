import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NotificationModal.module.css';
import ViewRecord from '../Record/ViewRecordModal'; // Import ViewRecord component
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationModal = ({ onClose, loggedInUser, notifications, setNotifications, refreshNotifications }) => {
  const navigate = useNavigate();
  const [showViewRecordModal, setShowViewRecordModal] = useState(false); // State to control the ViewRecord modal
  const [selectedNotificationId, setSelectedNotificationId] = useState(null); // Selected notification ID
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Automatically mark notifications as viewed when modal opens
  useEffect(() => {
    const markNotificationsAsViewed = async () => {
      try {
        await axios.post(`http://localhost:8080/notifications/user/${loggedInUser.userId}/mark-all-as-viewed`);
        refreshNotifications(); // Refresh notification count
      } catch (error) {
        console.error('Error marking notifications as viewed:', error);
      }
    };
  
    markNotificationsAsViewed();
  }, [loggedInUser, refreshNotifications]);

  const handleDeleteNotification = async (userNotificationId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this notification?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/notifications/delete/${userNotificationId}`);
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.userNotificationId !== userNotificationId)
        );

        refreshNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    } else {
      console.log('Notification deletion canceled');
    }
  };

  // Handle viewing a record in modal
  const handleViewRecord = (record) => {
      setSelectedRecord(record);
      setShowViewRecordModal(true);
  };

  const closeViewRecordModal = () => {
    setShowViewRecordModal(false);
    setSelectedRecord(null); // Clear the selected record ID
  };

  return (
    <div className={styles['notification-modal-overlay']}>
      <div className={styles['notification-modal-content']}>
        <button className={styles['notification-close-button']} onClick={onClose}>
          ✕
        </button>
        <h2 className={styles['notification-modal-title']}>Your Notifications</h2>

        {notifications.length > 0 ? (
          <ul className={styles['notification-modal-list']}>
            {notifications
              .sort((a, b) => b.notificationId - a.notificationId) // Sort by newest first
              .map(notification => (
                <li
                  key={notification.notificationId}
                  className={`${styles['notification-modal-list-item']} ${styles['clickable']}`}
                  onClick={() => handleViewRecord(notification.notification.record)}
                >
                  <strong>{notification.notification.message}</strong>
                  <br />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <small>Click to view details.</small>
                    <DeleteIcon
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the modal from opening when the delete button is clicked
                        handleDeleteNotification(notification.userNotificationId);
                      }}
                      className={styles['delete-icon']}
                      style={{color: '#8A252C'}}
                    />
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className={styles['notification-modal-empty-message']}>You have no new notifications.</p>
        )}
                
      </div>

      {/* View Record Modal */}
      {showViewRecordModal && selectedRecord && (
        <ViewRecord
          record={selectedRecord}
          onClose={closeViewRecordModal}
        />
      )}
    </div>
  );
};

export default NotificationModal;
