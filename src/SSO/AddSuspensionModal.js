import React, { useState } from 'react';
import axios from 'axios';
import styles from '../ReportModal.module.css'; // Importing the CSS file

const AddSuspensionModal = ({ onClose, reportId, refreshReports, refreshSuspensions }) => {
  const authToken = localStorage.getItem("authToken");
  const loggedInUser = authToken ? JSON.parse(authToken) : null;
  const [suspensionData, setSuspensionData] = useState({
    days: '',
    startDate: '',
    endDate: '',
    returnDate: ''
  });

 // Handle input changes for the form
const handleInputChange = (e) => {
  const { name, value } = e.target;

  setSuspensionData((prevData) => {
    if (name === "investigationDetails") {
      // Update nested 'investigationDetails' inside 'reportEntity'
      return {
        ...prevData,
        reportEntity: {
          ...prevData.reportEntity,
          investigationDetails: value,
        },
      };
    } else if (name === "days") {
      // Update 'days' if it's a positive integer or empty
      return {
        ...prevData,
        days: value === "" || parseInt(value) >= 1 ? value : prevData.days,
      };
    } else {
      // For other fields (e.g., dates)
      return {
        ...prevData,
        [name]: value,
      };
    }
  });
};



  // Handle adding suspension
  const handleCreateSuspension = async () => {
    try {
      const suspensionPayload = {
        ...suspensionData,
        reportId, // Use the reportId passed as a prop
        dateSubmitted: new Date().toISOString().split('T')[0], // Set the current date
      };
      console.log('Suspension Payload:', suspensionPayload);
      await axios.post(`http://localhost:8080/suspension/insertSuspension/${loggedInUser.userId}`, suspensionPayload);
      
      refreshSuspensions(); // Call the suspension refresh function passed from parent
      refreshReports(); // Optionally refresh reports to reflect any report changes
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error creating suspension:', error);
    }
  };

  return (
    <div className={styles['report-modal-overlay']}>
      <div className={styles['suspension-modal-content']}>
        <h2>Add Suspension</h2>

        <div className={styles['report-group']}>
          <label>Days of Suspension:</label>
          <input
            type="number"
            name="days"
            value={suspensionData.days}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={suspensionData.startDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={suspensionData.endDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>Return Date:</label>
          <input
            type="date"
            name="returnDate"
            value={suspensionData.returnDate}
            onChange={handleInputChange}
            className={styles['suspension-input']}
          />
        </div>

        <div className={styles['report-group']}>
          <label>Investigation Details:</label>
          <input
            type="text"
            name="investigationDetails"
            value={suspensionData.reportEntity.investigationDetails}
            onChange={handleInputChange}
            className={styles['complaint-textarea']}
          />
        </div>

        <div className={styles['report-buttonGroup']}>
          <button onClick={handleCreateSuspension} className={styles['report-button']}>
            Create
          </button>
          <button onClick={onClose} className={`${styles['report-button']} ${styles['report-button-cancel']}`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSuspensionModal;
