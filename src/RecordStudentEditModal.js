import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecordStudentEditModal.module.css'; 
import formStyles from './GlobalForm.module.css';

const RecordStudentEditModal = ({ record, onClose, refreshRecords }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  console.log("Record is: ",record)

  const monitoredRecords = [
    'Absent', 'Tardy', 'Cutting Classes', 'Improper Uniform', 
    'Offense', 'Misbehavior', 'Clinic', 'Sanction',
  ];

  const [selectedRecord, setSelectedRecord] = useState(record?.monitored_record || '');
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [sanction, setSanction] = useState(record?.sanction || '');
  const [complainant, setComplainant] = useState(record?.complainant || '');
  const [complaint, setComplaint] = useState(record?.complaint || '');
  const [investigationDetails, setInvestigationDetails] = useState(record?.investigationDetails || '');
  const [complete, setComplete] = useState(record?.complete || false);
  const [isSuspension, setIsSuspension] = useState(false); 
  const [suspensionDetails, setSuspensionDetails] = useState({
    days: '',
    startDate: '',
    endDate: '',
    returnDate: '',
  });

  const [existingSuspension, setExistingSuspension] = useState(null); // State to store existing suspension

  // Fetch suspension data on component mount
  useEffect(() => {
    const fetchSuspensionData = async () => {
      if (record?.recordId) {
        try {
          const response = await axios.get(`http://localhost:8080/suspension/getSuspensionByRecord/${record.recordId}`);
          if (response.data) {
            setExistingSuspension(response.data);
            setSuspensionDetails({
              days: response.data.days,
              startDate: response.data.startDate,
              endDate: response.data.endDate,
              returnDate: response.data.returnDate,
            });
            setIsSuspension(true);  // Set suspension state to true if a suspension exists
          }
        } catch (error) {
          console.error('Error fetching suspension data:', error);
        }
      }
    };

    fetchSuspensionData();
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
  
    let successMessage = 'Record updated successfully!';
  
    let formattedSanction = sanction;
  
    if (isSuspension) {
      formattedSanction = `Suspended for ${suspensionDetails.days} days starting from ${suspensionDetails.startDate} to ${suspensionDetails.endDate} and will be returned at ${suspensionDetails.returnDate}`;
    }
  

    console.log('Complete state before submit:', complete);
    // Map the 'complete' Boolean value to the correct integer (1, 0, or 2)
    const completeValue = complete ? 1 : (complete === false ? 0 : 2);
  
    // If suspension exists, update it
    if (isSuspension && existingSuspension) {
      const updatedSuspension = {
        ...suspensionDetails,
        recordId: record.recordId, // Include recordId
        dateSubmitted,
      };
  
      try {
        await axios.put(
          `http://localhost:8080/suspension/update/${existingSuspension.suspensionId}/${loggedInUser.userId}`,
          updatedSuspension
        );
        successMessage = 'Record updated successfully with its suspension!';
      } catch (error) {
        console.error('Error updating suspension:', error);
        alert('Failed to update suspension.');
      }
    } else if (isSuspension && !existingSuspension) {
      // If no suspension exists, insert a new one
      const newSuspension = {
        ...suspensionDetails,
        recordId: record.recordId, // Include recordId
        dateSubmitted,
      };
  
      try {
        await axios.post(
          `http://localhost:8080/suspension/insertSuspension/${loggedInUser.userId}`,
          newSuspension
        );
        successMessage = 'Record added successfully with its suspension!';
      } catch (error) {
        console.error('Error adding suspension:', error);
        alert('Failed to add suspension.');
      }
    }
  
    // If the user selects "No" for suspension and a suspension exists, delete the suspension
    if (!isSuspension && existingSuspension) {
      try {
        await axios.delete(
          `http://localhost:8080/suspension/delete/${existingSuspension.suspensionId}/${loggedInUser.userId}`
        );
        successMessage = 'Record updated successfully, suspension deleted!';
      } catch (error) {
        console.error('Error deleting suspension:', error);
        alert('Failed to delete suspension.');
      }
    }
  
    // Prepare the updated record data
    const updatedRecord = {
      ...record,
      monitored_record: selectedRecord,
      remarks: record.type === 2 ? null : remarks, // Set remarks to null if it's a case (record type 2)
      sanction: formattedSanction,
      complainant: complainant,
      complaint: complaint,
      investigationDetails: investigationDetails,
      complete: record.type === 1 ? 2 :  completeValue, // Send the correct integer value for complete
    };
  
    // Update the record
    try {
      await axios.put(
        `http://localhost:8080/record/update/${record.recordId}/${loggedInUser.userId}`,
        updatedRecord
      );
      alert(successMessage);
      refreshRecords();
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

          <label>Is Suspension?</label>
          <select
            value={isSuspension ? 'Yes' : 'No'}
            onChange={(e) => setIsSuspension(e.target.value === 'Yes')}
            className={styles.select}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          {isSuspension && (
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

          {!isSuspension && (
              <>
                <label>Sanction:</label>
                <input
                  type="text"
                  value={sanction}
                  onChange={(e) => setSanction(e.target.value)}
                />
              </>
            )}

          {record.type == 1 && (
            <>
              <label>Remarks:</label>
              <textarea 
                type="text" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} // Handling changes in remarks
              />
            </>
          )}

          {record.type == 2 && (
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
