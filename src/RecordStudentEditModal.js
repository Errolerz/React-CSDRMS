import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecordStudentEditModal.module.css'; // Import your CSS module
import formStyles from './GlobalForm.module.css';

const RecordStudentEditModal = ({ record, onClose }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const monitoredRecords = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    'Sanction',
  ];

  // Initialize state with the record's data
  const [selectedRecord, setSelectedRecord] = useState(record?.monitored_record || '');
  const [remarks, setRemarks] = useState(record?.remarks || ''); 
  const [sanction, setSanction] = useState(record?.sanction || '');
  const [complainant, setComplainant] = useState(record?.complainant || '');
  const [caseDetails, setCaseDetails] = useState(record?.caseDetails || '');
  const [complete, setComplete] = useState(record?.complete || false);

  // Effect to update local state when record prop changes
  useEffect(() => {
    if (record) {
      setSelectedRecord(record.monitored_record);
      setRemarks(record.remarks);
      setSanction(record.sanction);
      setComplainant(record.complainant || '');
      setCaseDetails(record.caseDetails || '');
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) {
      alert('Please select a monitored record.');
      return;
    }

    // Prepare the updated record
    const updatedRecord = {
      ...record,
      monitored_record: selectedRecord,
      remarks: remarks,
      sanction: sanction,
      complainant: complainant,  
      caseDetails: caseDetails, 
    };

    try {
      await axios.put(`http://localhost:8080/record/update/${record.recordId}/${loggedInUser.userId}`, updatedRecord);
      alert('Record updated successfully!');
      onClose(); // Close modal after submission
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Edit Student Record</h2>
        <form onSubmit={handleSubmit}>
          <label>Monitored Record:</label>
          <select 
            value={selectedRecord} 
            onChange={(e) => setSelectedRecord(e.target.value)}
            className={styles.select}
          >
            <option value="">Select a monitored record</option>
            {monitoredRecords.map((record, index) => (
              <option key={index} value={record}>
                {record}
              </option>
            ))}
          </select>
          {!record.complainant && (
            <>
              <label>Remarks:</label>
              <textarea 
                type="text" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} // Handling changes in remarks
              />
            <label>Sanction:</label>
            <textarea 
              type="text" 
              value={sanction} 
              onChange={(e) => setSanction(e.target.value)} 
            />
            </>
          )}


          {record.complainant && (
            <>
              <label>Complainant:</label>
              <input
                type="text"
                value={complainant}
                onChange={(e) => setComplainant(e.target.value)}
              />
              <label>Case Details:</label>
              <textarea
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
              />
               <label>Complete:</label>
                <input 
                  type="checkbox" 
                  checked={complete} 
                  onChange={(e) => setComplete(e.target.checked)} 
                />
            </>
          )}
        
          <div className={formStyles['global-buttonGroup']}>
            <button type="submit" className={formStyles['green-button']}>Edit</button>
            <button type="button" onClick={onClose} className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordStudentEditModal;
