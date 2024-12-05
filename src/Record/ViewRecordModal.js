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

  const isSourceType1 = record.source === 1;
  const isSourceType2 = record.source === 2;

  return (
    <div className={styles['record-modal-overlay']}>
      <div className={styles['record-modal-content']}>
        <button onClick={onClose} className={styles['closeButton']}>
          ✕
        </button>
        <h2 className={styles['modal-title']}>
          {isSourceType2 ? 'Complete Details of Case' : 'Complete Details of Record'}
        </h2>

        <table className={styles['details-table']}>
          <tbody>
            <tr>
              <td><strong>Name</strong></td>
              <td><strong>:</strong></td>
              <td>{record.student.name}</td>
            </tr>
            <tr>
              <td><strong>Grade & Section</strong></td>
              <td><strong>:</strong></td>
              <td>{record.student.grade} - {record.student.section}</td>
            </tr>
            <tr>
              <td><strong>Record Date</strong></td>
              <td><strong>:</strong></td>
              <td>{record.record_date || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Time</strong></td>
              <td><strong>:</strong></td>
              <td>{record.time || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Monitored Record</strong></td>
              <td><strong>:</strong></td>
              <td>{record.monitored_record || 'N/A'}</td>
            </tr>
            {/* Conditionally render fields based on case type */}
            {isSourceType1 && (
              <tr>
                <td><strong>Remarks</strong></td>
                <td><strong>:</strong></td>
                <td>{record.remarks || 'N/A'}</td>
              </tr>
            )}
            {/* Conditionally render fields based on case type */}
            {isSourceType2 && (
              <>
                <tr>
                  <td><strong>Complainant</strong></td>
                  <td><strong>:</strong></td>
                  <td>{record.complainant || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Status</strong></td>
                  <td><strong>:</strong></td>
                  <td
                    style={{
                      fontWeight: 'bold',
                      color: record.complete === 1 ? '#4caf50' : '#e53935',
                    }}
                  >
                    {record.complete === 1 ? 'Complete' : 'Incomplete'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Case Details</strong></td>
                  <td><strong>:</strong></td>
                  <td>
                    <strong>Complaint:</strong><br /> {record.complaint} <br /><br />
                    <strong>Investigation Details:</strong><br /> {record.investigationDetails || 'Under Investigation'}
                  </td>
                </tr>
              </>
            )}
            {suspensionStatus && (
              <tr>
                <td><strong>Suspension</strong></td>
                <td><strong>:</strong></td>
                <td
                  style={{
                    color: suspensionStatus === 'Approved' ? '#4caf50' : '#e53935',
                    fontWeight: 'bold',
                  }}
                >
                  {suspensionStatus}
                </td>
              </tr>
            )}            
            <tr>
              <td><strong>Sanction</strong></td>
              <td><strong>:</strong></td>
              <td>{record.sanction || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Encoder</strong></td>
              <td><strong>:</strong></td>
              <td>{`${record.encoder?.firstname || 'N/A'} ${record.encoder?.lastname || ''}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRecordModal;
