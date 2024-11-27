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
  const [complaint, setComplaint] = useState(record?.complaint || '');
  const [investigationDetails, setInvestigationDetails] = useState(record?.investigationDetails || '');
  const [complete, setComplete] = useState(record?.complete || false);
  const [isSuspension, setIsSuspension] = useState(false); // State for suspension toggle
const [suspensionDetails, setSuspensionDetails] = useState({
  days: '',
  startDate: '',
  endDate: '',
  returnDate: '',
});


  // Effect to update local state when record prop changes
  useEffect(() => {
    if (record) {
      setSelectedRecord(record.monitored_record);
      setRemarks(record.remarks);
      setSanction(record.sanction);
      setComplainant(record.complainant || '');
      setComplaint(record.complaint || '');
      setInvestigationDetails(record.investigationDetails || ''); 
    }
  }, [record]);

  const handleSuspensionChange = (e) => {
    const { name, value } = e.target;
    setSuspensionDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedRecord) {
      alert('Please select a monitored record.');
      return;
    }

    const dateSubmitted = new Date().toISOString().slice(0, 10);

        if (isSuspension) {
        try {
          const suspension = {
            ...suspensionDetails,
            recordId: record.recordId, // Include recordId
            dateSubmitted, // Include dateSubmitted
          };

          await axios.post(`http://localhost:8080/suspension/insertSuspension/${loggedInUser.userId}`, suspension);
          alert('Suspension added successfully!');
        } catch (error) {
          console.error('Error adding suspension:', error);
          alert('Failed to add suspension.');
        }
      }

      // Prepare the updated record
      const updatedRecord = {
        ...record,
        monitored_record: selectedRecord,
        remarks: remarks,
        sanction: sanction,
        complainant: complainant,
        complaint: complaint,
        investigationDetails: investigationDetails,
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
            </>
          )}

          <label>Is Suspension?</label>
          <select
            value={isSuspension ? 'Yes' : 'No'}
            onChange={(e) => setIsSuspension(e.target.value === 'Yes')}
            className={styles.select}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          {!isSuspension ? (
            <>
              <label>Sanction:</label>
              <textarea
                type="text"
                value={sanction}
                onChange={(e) => setSanction(e.target.value)}
              />
            </>
          ) : (
            <>
              <label>Suspension Days:</label>
              <input
                type="number"
                name="days"
                value={suspensionDetails.days}
                onChange={handleSuspensionChange}
              />

              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={suspensionDetails.startDate}
                onChange={handleSuspensionChange}
              />

              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={suspensionDetails.endDate}
                onChange={handleSuspensionChange}
              />

              <label>Return Date:</label>
              <input
                type="date"
                name="returnDate"
                value={suspensionDetails.returnDate}
                onChange={handleSuspensionChange}
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
              <label>Complaint:</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
              <label>Investigation Details:</label>
                <textarea
                  value={investigationDetails}
                  onChange={(e) => setInvestigationDetails(e.target.value)}
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
