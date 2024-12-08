import React from 'react';
import styles from './StudentDetailsModal.module.css';

const StudentDetailsModal = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Student Details</h3>
          <button onClick={onClose} className={styles.closeIcon}>
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <table className={styles.detailsTable}>
            <tbody>
              <tr>
                <td className={styles.keyColumn}>ID Number</td>
                <td className={styles.separator}>:</td>
                <td>{student.sid || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Name</td>
                <td className={styles.separator}>:</td>
                <td>{student.name || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Grade & Section</td>
                <td className={styles.separator}>:</td>
                <td>{student.grade} - {student.section}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Adviser</td>
                <td className={styles.separator}>:</td>
                <td>{student.adviser || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Gender</td>
                <td className={styles.separator}>:</td>
                <td>{student.gender || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Email Address</td>
                <td className={styles.separator}>:</td>
                <td>{student.email || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Home Address</td>
                <td className={styles.separator}>:</td>
                <td>{student.homeAddress || 'N/A'}</td>
              </tr>
              <tr>
                <td className={styles.keyColumn}>Emergency No.</td>
                <td className={styles.separator}>:</td>
                <td>{student.emergencyNumber || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
