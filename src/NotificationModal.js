import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NotificationModal.module.css';
import ViewReport from './ViewReport'; // Import ViewReport component

const NotificationModal = ({ onClose, loggedInUser, notifications, refreshNotifications }) => {
  const navigate = useNavigate();
  const [showViewReportModal, setShowViewReportModal] = useState(false); // State to control the ViewReport modal
  const [selectedNotificationId, setSelectedNotificationId] = useState(null); // Selected notification ID
  const [selectedReportId, setSelectedReportId] = useState(null);

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
  

  // Handle viewing a report in modal
  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setShowViewReportModal(true); // Show the ViewReport modal
  };

  const closeViewReportModal = () => {
    setShowViewReportModal(false);
    setSelectedReportId(null); // Clear the selected report ID
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
                  onClick={() => handleViewReport(notification.notification.report.reportId)}
                >
                  <strong>{notification.notification.message}</strong>
                  <br />
                  <small>Click to view details.</small>
                </li>
              ))}
          </ul>
        ) : (
          <p className={styles['notification-modal-empty-message']}>You have no new notifications.</p>
        )}
                
      </div>

      {/* ViewReport Modal */}
      {showViewReportModal && selectedReportId && (
        <ViewReport
          reportId={selectedReportId}
          onClose={closeViewReportModal}
        />
      )}
    </div>
  );
};

export default NotificationModal;
