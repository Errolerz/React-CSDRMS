import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddStudentRecordModal.module.css';
import formStyles from '../GlobalForm.module.css';

const AddRecordModal = ({ student, onClose, refreshRecords }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);

  const [report, setReport] = useState(null);


  // Form state
  const [recordDate, setRecordDate] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [time, setTime] = useState('');
  const [monitoredRecord, setMonitoredRecord] = useState('');
  const [complainant, setComplainant] = useState(`${loggedInUser.firstname} ${loggedInUser.lastname}`);
  const [complaint, setComplaint] = useState('');
  const [remarks, setRemarks] = useState('');
  const [complete, setComplete] = useState('');

  // State for dynamic student selection
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const monitoredRecordsList = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    'Sanction',
  ];

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
    if (loggedInUser.userType !== 1) {
      setReport(true);
      setComplainant(`${loggedInUser.firstname} ${loggedInUser.lastname}`);
      setComplete(0); // Assuming '0' means incomplete or pending
    }

  }, []);

  const handleSubmit = async () => {

    if (report && (!complainant || !complaint)) {
      alert('Please fill in all required fields for the report.');
      return;
    }


    const newRecord = {
      id: student?.id || selectedStudent?.id, // Use selected student if `student` is null
      encoderId: loggedInUser.userId,
      name: student?.name || selectedStudent?.name, // Use selected student name
      record_date: recordDate,
      incident_date: incidentDate,
      time: time,
      monitored_record: monitoredRecord,
      remarks: remarks,
      complainant: complainant,
      complaint: complaint,
      complete: complete,
    };

    try {
      await axios.post(`http://localhost:8080/record/insert/${loggedInUser.userId}`, newRecord);
      alert('Record added successfully');
      refreshRecords(); // Fetch updated records
      onClose(); // Close modal
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error adding record');
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle the student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.sid} - ${student.name}`); // Set search query to selected student's name
  };

  // Handle removing selected student
  const handleRemoveStudent = () => {
    setSelectedStudent(null);
    setSearchQuery(''); // Clear the search query when removing student
  };

  const handleReportChange = (e) => {
    const value = e.target.value;
    setReport(value === 'yes');
    // Set complainant based on the selection
    if (value === 'yes') {
      setComplainant(`${loggedInUser.firstname} ${loggedInUser.lastname}`);
      setComplete(0);
    } else if (value === 'no') {
      setComplainant(null);
      setComplete(2);
    }
  };
  return (
    <div className={styles['student-modal-overlay']}>
      <div className={styles['student-add-modal-content']}>
        <h2>Add New Record</h2>

        <div className={formStyles['form-container']}>
          {!student && (
            <>
              <div className={formStyles['form-group']}>
                <label>Search Student:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={formStyles['input']}
                  placeholder="Type to search student by name"
                  disabled={selectedStudent}
                />

              {selectedStudent && (
                <button className={styles.clearButton} onClick={handleRemoveStudent}>
                ✕
              </button>
              )}
              </div>

              {!selectedStudent && (
                <div>
              {searchQuery && filteredStudents.length > 0 ? (
                <ul className={styles.dropdown}>
                  {filteredStudents.map((student) => (
                    <li key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={styles.dropdownItem}>
                      {student.name} ({student.sid})
                    </li>
                  ))}
                </ul>
              ) : searchQuery && filteredStudents.length === 0 ? (
                <p className={styles.dropdown}>No students found.</p>
              ) : null }
              </div>
            )}
            </>
          )}

          <div className={formStyles['form-group']}>
            <label>Record Date:</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Incident Date:</label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={formStyles['input']}
            />
          </div>

          <div className={formStyles['form-group']}>
            <label>Monitored Record:</label>
            <select
              value={monitoredRecord}
              onChange={(e) => setMonitoredRecord(e.target.value)}
              className={`${formStyles['input']} ${styles['student-modal-select']}`}
            >
              <option value="">Select Record Type</option>
              {monitoredRecordsList.map((record) => (
                <option key={record} value={record}>
                  {record}
                </option>
              ))}
            </select>
          </div>

          {loggedInUser.userType === 1 && (
          <div className={formStyles['form-group']}>
            <label>Is this a Report?</label>
            <select
              value={report === null ? '' : report ? 'yes' : 'no'}  // Default value is empty
              onChange={handleReportChange}
              className={`${formStyles['input']} ${styles['student-modal-select']}`}
            >
              <option value="" disabled>Select</option> {/* Empty option as default */}
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          )}

          {report !== null && report ? (
            <>
              <div className={formStyles['form-group']}>
                <label>Complainant:</label>
                <input
                  type="text"
                  value={complainant}
                  onChange={(e) => setComplainant(e.target.value)}
                  className={formStyles['input']}
                />
              </div>
              <div className={formStyles['form-group']}>
                <label>Complaint:</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className={formStyles['form-group-textarea']}
                />
              </div>
            </>
          ) : report !== null && !report ? (
            // If "No" is selected, show Remarks field
            <div className={formStyles['form-group']}>
              <label>Remarks:</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={formStyles['form-group-textarea']}
              />
            </div>
          ) : null }

          <div className={formStyles['global-buttonGroup']}>
            <button className={formStyles['green-button']} onClick={handleSubmit}>
              Submit
            </button>
            <button
              className={`${formStyles['green-button']} ${formStyles['red-button']}`}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRecordModal;
