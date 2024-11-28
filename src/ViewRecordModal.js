import React from 'react';
import styles from './ViewRecordModal.module.css';

const ViewRecordModal = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className={styles['record-modal-overlay']}>
      <div className={styles['record-modal-content']}>
        <button onClick={onClose} className={styles['closeButton']}>
          ✕
        </button>
        <h2 className={styles['modal-title']}>Complete Details of Record</h2>

        <table className={styles['details-table']}>
          <tbody>
            <tr>
              <td><strong>Record Date</strong></td>
              <td><strong>:</strong></td>
              <td>{record.record_date || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Monitored Record</strong></td>
              <td><strong>:</strong></td>
              <td>{record.monitored_record || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Encoder</strong></td>
              <td><strong>:</strong></td>
              <td>{`${record.encoder?.firstname || 'N/A'} ${record.encoder?.lastname || ''}`}</td>
            </tr>
            <tr>
              <td><strong>Remarks</strong></td>
              <td><strong>:</strong></td>
              <td>{record.remarks || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Sanction</strong></td>
              <td><strong>:</strong></td>
              <td>{record.sanction || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRecordModal;
