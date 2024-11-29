import React from 'react';
import styles from './ViewRecordModal.module.css';

const ViewRecordModal = ({ record, onClose }) => {
  if (!record) return null;

  const isCaseType1 = record.type === 1;
  const isCaseType2 = record.type === 2;

  return (
    <div className={styles['record-modal-overlay']}>
      <div className={styles['record-modal-content']}>
        <button onClick={onClose} className={styles['closeButton']}>
          ✕
        </button>
        <h2 className={styles['modal-title']}>
          {isCaseType2 ? 'Complete Details of Case' : 'Complete Details of Record'}
        </h2>

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
            {/* Conditionally render fields based on case type */}
            {isCaseType1 && (
              <tr>
                <td><strong>Remarks</strong></td>
                <td><strong>:</strong></td>
                <td>{record.remarks || 'N/A'}</td>
              </tr>
            )}
            {/* Conditionally render fields based on case type */}
            {isCaseType2 && (
              <>
                <tr>
                  <td><strong>Complainant</strong></td>
                  <td><strong>:</strong></td>
                  <td>{record.complainant || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Case Details</strong></td>
                  <td><strong>:</strong></td>
                  <td>
                    <strong>Complaint:</strong> {record.complaint} <br />
                    <strong>Investigation Details:</strong> {record.investigationDetails || 'Under Investigation'}
                  </td>
                </tr>
              </>
            )}
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
