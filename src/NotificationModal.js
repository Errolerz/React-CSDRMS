import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NotificationModal.module.css';

const NotificationModal = ({ onClose, loggedInUser, reports, suspensions, refreshNotifications }) => {
  const navigate = useNavigate();

  // Automatically mark notifications as viewed when modal opens
  useEffect(() => {
    const markNotificationsAsViewed = async () => {
      try {
        // Logic to update "received" status for userType === 1
        if (loggedInUser?.userType === 1) {
          // Mark notifications as viewed
          await axios.post('http://localhost:8080/report/markAsViewedForSso');
          await axios.post('http://localhost:8080/suspension/markAsViewedForSso');
          
          // Fetch reports and update "received" status
          const response = await axios.get('http://localhost:8080/report/getAllReports'); // Fetch all reports
          const currentDate = new Date().toISOString().split('T')[0];

          const updates = response.data
            .filter(report => !report.received) // Filter unreceived reports
            .map(report => axios.put(`http://localhost:8080/report/updateReceived/${report.reportId}`, { received: currentDate }));

          await Promise.all(updates); // Update all unreceived reports
        } else if (loggedInUser?.userType === 2) {
          await axios.post('http://localhost:8080/suspension/markAsViewedForPrincipal');
        } else if (loggedInUser?.userType === 3) {
          await axios.post('http://localhost:8080/report/markAsViewedForAdviser', null, {
            params: {
              grade: loggedInUser.grade,
              section: loggedInUser.section,
              schoolYear: loggedInUser.schoolYear,
            },
          });
          await axios.post('http://localhost:8080/suspension/markAsViewedForAdviser', null, {
            params: {
              grade: loggedInUser.grade,
              section: loggedInUser.section,
              schoolYear: loggedInUser.schoolYear,
            },
          });
        } else if (loggedInUser?.userType === 5 || loggedInUser?.userType === 6) {
          await axios.post('http://localhost:8080/suspension/markAsViewedForComplainant', null, {
            params: {
              username: loggedInUser.username,
            },
          });
        }
        refreshNotifications();
      } catch (error) {
        console.error('Error marking notifications as viewed:', error);
      }
    };

    markNotificationsAsViewed();
  }, [loggedInUser, refreshNotifications]);

  // Handle viewing a report
  const handleViewReport = (reportId) => {
    navigate(`/view-report/${reportId}`);
  };

  return (
    <div className={styles['notification-modal-overlay']}>
        <div className={styles['notification-modal-content']}>
            <button className={styles['notification-close-button']} onClick={onClose}>
                ✕
            </button>
            <h2 className={styles['notification-modal-title']}>Your Notifications</h2>

            <h3 className={styles['notification-modal-section-title']}>New Reports</h3>
            {reports.length > 0 ? (
                <ul className={styles['notification-modal-list']}>
                    {reports
                        .filter(report => report.complainant !== loggedInUser?.username)
                        .map((report) => (
                            <li
                                key={report.reportId}
                                className={`${styles['notification-modal-list-item']} ${styles['clickable']}`}
                                onClick={() => handleViewReport(report.reportId)}
                            >
                                <strong>{report.record.student.name}</strong> from <strong>{report.record.student.grade} - {report.record.student.section}</strong> has a report concerning a recent incident. <br />
                                <small>Click to view details.</small>
                            </li>
                        ))}
                </ul>
            ) : (
                <p className={styles['notification-modal-empty-message']}>You have no new reports at the moment.</p>
            )}

            {loggedInUser?.userType !== 1 && (
                <>
                    <h3 className={styles['notification-modal-section-title']}>Recent Suspensions</h3>
                    {suspensions.length > 0 ? (
                        <ul className={styles['notification-modal-list']}>
                            {suspensions.map((suspension) => (
                                <li
                                    key={suspension.suspensionId}
                                    className={`${styles['notification-modal-list-item']} ${styles['clickable']}`}
                                    onClick={() => handleViewReport(suspension.reportEntity.reportId)}
                                >
                                    <strong>{suspension.reportEntity.record.student.name}</strong> has been suspended. 
                                    <br />
                                    <small>Click to view report details.</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles['notification-modal-empty-message']}>No suspensions recorded at this time.</p>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default NotificationModal;
