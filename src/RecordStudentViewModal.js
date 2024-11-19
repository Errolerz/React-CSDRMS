import React from 'react';
import styles from './RecordModal.module.css'; // Use the same styles as the other modals

const RecordStudentViewModal = ({ record, onClose }) => {
    if (!record) return null; // Return nothing if there is no record
    return (
        <div className={styles['record-modal-overlay']}>
            <div className={styles['record-modal-content']}>
                <button onClick={onClose} className={styles['closeButton']}>✕</button>
                <h2>Complete Details of Record</h2>
                <div className={styles['record-tableWrapper']}>
                    <table className={styles['record-table']}>
                        <thead>
                            <tr>
                            <th>Record ID</th>
                
                            <th>Record Date</th>
                            <th>Incident Date</th>
                            <th>Time</th>
                            <th>Monitored Record</th>
                            <th>Remarks</th>
                            <th>Sanction</th>
                            <th>Complainant</th>
                            <th>Case Details</th>
                            <th>Complete</th>
                            <th>Encoder</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>{record.recordId}</td>
                 
                            <td>{record.record_date}</td>
                            <td>{record.incident_date}</td>
                            <td>{record.time}</td>
                            <td>{record.monitored_record}</td>
                            <td>{record.remarks}</td>
                            <td>{record.sanction}</td>
                            <td>{record.complainant ? record.complainant : 'N/A'}</td>
                            <td>{record.caseDetails}</td>
                            <td>
                            {record.complete === 0
                                ? 'Incomplete'
                                : record.complete === 1
                                ? 'Complete'
                                : 'N/A'}
                            </td>
                            <td>{record.encoder.firstname} {record.encoder.lastname}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecordStudentViewModal;
