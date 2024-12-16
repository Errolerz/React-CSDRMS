import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RecordStudentEditModal.module.css'; 
import formStyles from './GlobalForm.module.css';

const RecordStudentEditModal = ({ record, onClose, refreshRecords }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);

  const monitoredRecords = [
    'Absent', 'Tardy', 'Cutting Classes', 'Improper Uniform', 
    'Offense', 'Misbehavior', 'Clinic', 
    ...(record.source === 1 ? ['Lost/Found Items', 'Request ID', 'Request Permit'] : []),
  ];

  const [selectedRecord, setSelectedRecord] = useState(record?.monitored_record || '');
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [sanction, setSanction] = useState(record?.sanction || '');
  const [complainant, setComplainant] = useState(record?.complainant || '');
  const [complaint, setComplaint] = useState(record?.complaint || '');
  const [investigationDetails, setInvestigationDetails] = useState(record?.investigationDetails || '');
  const [complete, setComplete] = useState(record?.complete || 0);
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

  const isSpecialRecord = ['Lost/Found Items', 'Request ID', 'Request Permit'].includes(selectedRecord);

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
      remarks: record.complaint === 2 ? null : remarks, // Set remarks to null if it's a case (record type 2)
      sanction: formattedSanction,
      complainant: complainant,
      complaint: complaint,
      investigationDetails: investigationDetails,
      complete: complete, // Send the correct integer value for complete
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
        <h2>{record.source === 2 ? 'Investigate Student Case' : 'Edit Student Record'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
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
          </div>

          {record.source == 2 && (
            <>
              <div className={styles.inputGroup}>     
                <label>Complainant:</label>
                <input
                  type="text"
                  value={complainant}
                  onChange={(e) => setComplainant(e.target.value)}
                />
              </div>

              
              <div className={styles.inputGroup}>
                <label>Complaint:</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
              </div>
              
              {loggedInUser.userType == 1 && (
              <div className={styles.inputGroup}>
                <label>Investigation Details:</label>
                  <textarea
                    value={investigationDetails}
                    onChange={(e) => setInvestigationDetails(e.target.value)}
                  />
              </div>
              )}
            </>
          )}

          {record.source == 1 && (
            <>
              <div className={styles.inputGroup}>                 
                <label>Remarks:</label>
                <textarea 
                  type="text" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)} // Handling changes in remarks
                />
              </div>
            </>
          )}

          {loggedInUser.userType === 1 && !isSpecialRecord &&  !isSuspension && (
            <>
              <div className={styles.inputGroup}>     
                <label>Sanction:</label>
                <textarea
                  type="text"
                  value={sanction}
                  onChange={(e) => setSanction(e.target.value)}
                />
              </div>
            </>
          )}          

          {loggedInUser.userType === 1 && record.source == 2 && !isSuspension && (
            <>
              <div className={styles.inputGroup}>
                <label>Is the Case Complete?</label>
                <select
                  name="caseComplete"
                  value={complete === 1 ? "yes" : "no"} // Maps complete to "yes" or "no"
                  onChange={(e) => setComplete(e.target.value === "yes" ? 1 : 0)} // Update complete based on selection
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </>
          )}
          {loggedInUser.userType === 1 && !isSpecialRecord &&  (
          <div className={styles.inputGroup}>
            <label>Should the student be suspended ?</label>
            <select
              value={isSuspension ? 'Yes' : 'No'}
              onChange={(e) => {
                const isSuspended = e.target.value === 'Yes';
                setIsSuspension(isSuspended);
                if (!isSuspended && existingSuspension) {
                  setSanction(''); // Clear sanction if suspension is turned off
                }
              }}
              className={styles.select}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
            )}

          {isSuspension && (
            <div className={styles.suspensionSection}>
              <div className={styles.inputGroup}>
                <label>Suspension Days:</label>
                <input
                  type="number"
                  name="days"
                  value={suspensionDetails.days}
                  onChange={handleSuspensionChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={suspensionDetails.startDate}
                  onChange={handleSuspensionChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={suspensionDetails.endDate}
                  onChange={handleSuspensionChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Return Date:</label>
                <input
                  type="date"
                  name="returnDate"
                  value={suspensionDetails.returnDate}
                  onChange={handleSuspensionChange}
                />
              </div>
            </div>
          )}

          <div className={formStyles['global-buttonGroup']}>
            <button type="submit" className={formStyles['green-button']}>
              {record.source === 2 ? 'Investigate' : 'Edit'}
            </button>
            <button type="button" onClick={onClose} className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordStudentEditModal;
