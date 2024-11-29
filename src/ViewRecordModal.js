import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ViewRecordModal.module.css';

const ViewRecordModal = ({ record, onClose }) => {
  const [suspensionStatus, setSuspensionStatus] = useState(null);
  
  useEffect(() => {
    const fetchSuspensionData = async () => {
      if (record?.recordId) {
        try {
          const response = await axios.get(`http://localhost:8080/suspension/getSuspensionByRecord/${record.recordId}`);
          if (response.data) {
            // Check if the suspension is approved or not
            const status = response.data.approved ? 'Approved' : 'Not Approved';  // Or 'Pending' depending on your choice
            setSuspensionStatus(status);
          }
        } catch (error) {
          console.error('Error fetching suspension data:', error);
        }
      }
    };
    
    fetchSuspensionData();
  }, [record]);

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
            {suspensionStatus && (
                  <tr>
                    <td><strong>Suspension</strong></td>
                    <td><strong>:</strong></td>
                    <td>{suspensionStatus || 'N/A'}</td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRecordModal;
