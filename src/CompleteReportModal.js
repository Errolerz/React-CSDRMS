import React, { useState } from 'react';
import axios from 'axios'; // Ensure you have axios imported
import styles from './CompleteReportModal.module.css'; // Import the CSS module for styling

const CompleteReportModal = ({ reportId, onClose, refreshReports }) => {
  const [comment, setComment] = useState('');

  const handleCompleteReport = async () => {
    try {
        await axios.put(`http://localhost:8080/report/complete/${reportId}`, null, {
            params: { comment }
          });
      refreshReports(); // Refresh the reports after completion
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error completing the report:', error);
      alert('Failed to complete the report. Please try again.');
    }
  };

  return (
    <div className={styles['complete-report-modal']}>
      <div className={styles['complete-report-modal-content']}>
        <div className={styles['complete-report-modal-header']}>
          <h2 className={styles['complete-report-modal-title']}>Complete Report</h2>
          <button 
            onClick={onClose} 
            className={styles['complete-report-modal-close-button']}
          >
            &times;
          </button>
        </div>
        <div className={styles['complete-report-modal-body']}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className={styles['complete-report-modal-comment']}
          />
        </div>
        <div className={styles['complete-report-modal-footer']}>
          <button 
            onClick={handleCompleteReport} 
            className={styles['complete-report-modal-submit-button']}
          >
            Complete
          </button>
          <button 
            onClick={onClose} 
            className={styles['complete-report-modal-cancel-button']}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteReportModal;
