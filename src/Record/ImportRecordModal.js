import React, { useState } from 'react';
import axios from 'axios';
import buttonStyles from '../GlobalButton.module.css';
import Loader from '../Loader'; // Assuming a loader component exists
import styles from './ImportRecordModal.module.css'; // Import the CSS module

const ImportRecordModal = ({ isOpen, onClose, refreshRecords, loggedInUser }) => {
  const [file, setFile] = useState(null); // State to hold the selected file
  const [loading, setLoading] = useState(false); // Loading state for the file upload

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
  };

  const handleFileUpload = () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true); // Show loading indicator

    const formData = new FormData();
    formData.append('file', file);

    // Sending the file to the backend for import
    axios
      .post(`http://localhost:8080/record/import/${loggedInUser.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        const { importedCount, nonExistentStudents, duplicateCount} = response.data; // Expecting structured response
  
        let alertMessage = `File uploaded successfully, ${importedCount} records were imported.`;

        if (duplicateCount > 0) {
          alertMessage += `\n\nWarning: ${duplicateCount} duplicate records were detected and not imported.`;
        }

        if (nonExistentStudents?.length > 0) {
          const studentList = nonExistentStudents.join('\n'); // Format the list as a newline-separated string
          alertMessage += `\n\nThe following students were not found and therefore were not imported:\n${studentList}\n\nIf the following students do exist, please ensure that their names in the records match exactly with those in the student list`;
        }
      
        alert(alertMessage); // Display the alert message

        refreshRecords(); // Refresh the records after import
        onClose(); // Close the modal after successful upload
      })
      .catch((error) => {
        console.error('Error importing records:', error);
        alert('Failed to upload file: ' + error.message);
      })
      .finally(() => {
        setLoading(false); // Hide loading indicator after the upload is complete or fails
      });
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className={styles['record-modal-overlay']}>
      <div className={styles['record-import-modal-content']}>
        <h2 className={styles['record-modal-header']}>Import Records</h2>
        <label>Select a file for Import:</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className={styles['record-modal-file-input']}
        />
        <div className={buttonStyles['button-group']}>
          {loading ? (
            <Loader />
          ) : (
            <>
              <button
                className={`${buttonStyles['action-button']} ${buttonStyles['green-button']}`}
                onClick={handleFileUpload}
              >
                Import
              </button>
              <button
                className={`${buttonStyles['action-button']} ${buttonStyles['red-button']}`}
                onClick={onClose}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportRecordModal;
