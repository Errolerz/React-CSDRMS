import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import styles from '../Record/Record.module.css'; // Importing CSS module
import navStyles from '../Navigation.module.css'; 
import formStyles from '../GlobalForm.module.css'; // Importing GlobalForm styles
import buttonStyles from '../GlobalButton.module.css'; // Importing GlobalForm styles
import tableStyles from '../GlobalTable.module.css'; // Importing GlobalForm styles
import Navigation from '../Navigation';

import RecordFilter from './RecordFilter'; // Import RecordFilter component
import ImportModal from './StudentImportModal'; // Import ImportModal component
import AddStudentModal from './AddStudentModal';
import AddRecordModal from '../Record/AddRecordModal'; // Import AddRecordModal component
import EditStudentModal from './EditStudentModal'; // Ensure this path matches the actual file location
import RecordStudentEditModal from '../Record/EditRecordModal';
import RecordStudentViewModal from '../Record/ViewRecordModal'; // Import the view modal

import AddStudentIcon from '@mui/icons-material/PersonAdd';
import ImportIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 

const Student = () => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const [filteredStudents, setFilteredStudents] = useState([]); // For filtered search results
  const [searchQuery, setSearchQuery] = useState(''); // Hold the search term
  const [selectedStudent, setSelectedStudent] = useState(null); // Hold the selected student
  const [adviser, setAdviser] = useState(null); // Hold adviser's data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [selectedWeek, setSelectedWeek] = useState('');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false); // Modal visibility state
  const [showImportModal, setShowImportModal] = useState(false); // Control ImportModal visibility
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); 
  const [showEditRecordModal, setShowEditRecordModal] = useState(false); // Modal visibility state
  const [showViewRecordModal, setShowViewRecordModal] = useState(false); // State to control view modal
  const [recordToEdit, setRecordToEdit] = useState(null); // Hold the record to edit
  const [recordToView, setRecordToView] = useState(null); // Hold the record to view

  const [schoolYears, setSchoolYears] = useState([]); // State for school years
  const [students, setStudents] = useState([]); // State for students

  const [showEditStudentModal, setShowEditStudentModal] = useState(false); // Manage EditStudentModal visibility
  const [studentToEdit, setStudentToEdit] = useState(null);


  const monitoredRecordsList = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    'Request Permit',
  ];

  const fetchStudents = useCallback(async () => {
    try {
      let response;
      const userType = loggedInUser.userType;
      if (userType === 3) {
        response = await axios.get('http://localhost:8080/student/getAllStudentsByAdviser', {
          params: {
            grade: loggedInUser.grade,
            section: loggedInUser.section,
            schoolYear: loggedInUser.schoolYear
          }
        });
      } else {
        response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
      }
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  useEffect(() => {
    if (!loggedInUser) return;
    
    console.log('loggedInUser.userType:', loggedInUser?.userType); // Debug log

    const userTypeTitles = {
      1: 'SSO',
      3: 'Adviser',
    };
  
    const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
    document.title = `${userTypeTitle} | Student Overview`;
  }, [loggedInUser]);

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
        setSchoolYears(response.data);
      } catch (error) {
        console.error('Error fetching school years:', error);
      }
    };
    
    fetchSchoolYears();
    fetchStudents();
  }, [fetchStudents]); // Add fetchStudents to the dependency array if it's declared outside the effect
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Close the respective modals when the 'Esc' key is pressed
        if (showAddStudentModal) setShowAddStudentModal(false);
        if (showEditRecordModal) setShowEditRecordModal(false);
        if (showViewRecordModal) setShowViewRecordModal(false);
        if (showAddRecordModal) setShowAddRecordModal(false);
        if (showImportModal) setShowImportModal(false);
        if (showEditStudentModal) setShowEditStudentModal(false);
      }
    };
  
    // Attach the event listener when any modal is open
    if (showAddStudentModal || showEditRecordModal || showViewRecordModal || showAddRecordModal || showImportModal || showEditStudentModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
  
    // Clean up the event listener when the modals are closed or component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddStudentModal, showEditRecordModal, showViewRecordModal, showAddRecordModal, showImportModal, showEditStudentModal]);
  
  

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredStudents([]); // Show no students when search query is empty
    } else {
      const lowercasedSearchTerm = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(lowercasedSearchTerm) ||
          student.sid.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudentRecords = async (sid) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/record/getStudentRecords/${sid}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching student records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdviser = async (grade, section, schoolYear) => {
    try {
      const response = await axios.get(`http://localhost:8080/user/adviser`, {
        params: { grade, section, schoolYear }
      });
      setAdviser(response.data);
    } catch (error) {
      console.error('Error fetching adviser:', error);
    }
  };
  
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentRecords(student.sid); // Fetch records for the selected student
    fetchAdviser(student.grade, student.section, student.schoolYear); // Fetch adviser's info
    setSearchQuery(''); // Reset search query to close the dropdown
  };

  const getWeekNumber = (date) => {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
  };

  const filteredRecords = records.filter((record) => {
    const recordMonth = new Date(record.record_date).getMonth() + 1;
    const formattedMonth = recordMonth < 10 ? `0${recordMonth}` : `${recordMonth}`;

    const recordWeek = getWeekNumber(new Date(record.record_date));

    return (
      (!selectedSchoolYear || record.student.schoolYear === selectedSchoolYear) &&
      (!selectedMonth || formattedMonth === selectedMonth) &&
      (!selectedWeek || recordWeek === parseInt(selectedWeek, 10))
    );
  });

  const countFrequency = () => {
    const frequencies = monitoredRecordsList.reduce((acc, record) => {
      acc[record] = 0; // Initialize each monitored record with 0
      return acc;
    }, {});
  
    filteredRecords.forEach((record) => {
      if (frequencies[record.monitored_record] !== undefined) {
        frequencies[record.monitored_record]++;
      }
    });
  
    // Count sanctions separately
    const sanctionFrequency = filteredRecords.reduce((count, record) => {
      if (record.sanction) {
        count++;
      }
      return count;
    }, 0);
  
    return { ...frequencies, Sanction: sanctionFrequency };
  };
  
  const frequencies = countFrequency();

  const handleDeleteRecord = async (recordId) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?'); // Confirmation alert
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:8080/record/delete/${recordId}/${loggedInUser.userId}`); // Call your delete API
        setRecords(records.filter((record) => record.recordId !== recordId)); // Remove the deleted record from state
        alert('Record deleted successfully!'); // Optionally, show a success message
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.'); // Optionally, show an error message
      }
    }
  };

  const handleEditStudent = (student) => {
    setStudentToEdit(student); // Set the selected student data
    setShowEditStudentModal(true); // Show EditStudentModal
  };
  

  const handleDeleteStudent = async (studentId) => {
    // Show confirmation alert before deleting
    const confirmed = window.confirm('Are you sure you want to delete this student? This action cannot be undone and all its associated suspensions, reports and monitored records will be deleted.');
    
    if (confirmed) {
      try {
        // Perform DELETE request to the backend API
        await axios.delete(`http://localhost:8080/student/delete/${studentId}/${loggedInUser.userId}`);
        
        // Update state: Remove the deleted student from the list and clear the selected student
        setStudents(students.filter((student) => student.id !== studentId));
        setSelectedStudent(null); // Clear the selection if the deleted student was selected
        
        // Show a success message
        alert('Student deleted successfully!');
      } catch (error) {
        console.error('Error deleting student:', error);
        
        // Show an error message in case of failure
        alert('Failed to delete student. Please try again.');
      }
    }
  };
  
  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div className={navStyles.content}>  
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>Student Overview</h2>
          <div className={buttonStyles['button-group']}>
            {loggedInUser?.userType !== 3 && (
              <button onClick={() => setShowAddStudentModal(true)} 
                className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}>
                <AddStudentIcon />Add Student
              </button>
            )}     

            {/* Button to open Import Modal */}
            {loggedInUser?.userType !== 3 && (
              <button onClick={() => setShowImportModal(true)} 
                className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}>
                <ImportIcon />Import Student
              </button>
            )}    
          </div>                
        </div>  

        <h2 className={styles['h2-title-record']}>Total Frequency of Monitored Records</h2>
        <div className={tableStyles['table-container']} style={{ marginBottom: '20px' }}>
          <table className={tableStyles['global-table-small']}>
            <thead>
              <tr>
                {monitoredRecordsList.map((monitoredRecord, index) => (
                  <th key={index}>{monitoredRecord}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {monitoredRecordsList.map((monitoredRecord, index) => (
                  <td key={index}>{frequencies[monitoredRecord]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles['triple-container']}>
          {/* Display selected student details */}        
          <div className={styles['details-container']} sx={{mt:"0"}}> 
            <label style={{ display: 'flex', justifyContent: 'space-between' ,alignItems:"center"}}> Details:
              {selectedStudent && (
                <div className={formStyles['global-buttonGroup']} style={{marginTop:"0"}}>
                  <EditNoteIcon 
                    onClick={() => handleEditStudent(selectedStudent)} 
                    className={formStyles['action-icon']} 
                  />
                  <DeleteIcon 
                    onClick={() => handleDeleteStudent(selectedStudent.id)} 
                    className={formStyles['action-icon']}
                  />
                </div>
              )}      
            </label>
              <table className={styles['details-table']}>
                <tbody>
                  <tr>
                    <td><strong>ID Number</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.sid || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Name</strong></td>
                    <td><strong>:</strong></td>
                    <td style={{ width: '75%', whiteSpace: 'nowrap', overflow: 'hidden',  textOverflow:'ellipsis'}}>
                      {selectedStudent?.name || 'N/A'}
                    </td>     
                  </tr>
                  <tr>
                    <td><strong>Grade</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.grade || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Section</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.section || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Adviser</strong></td>
                    <td><strong>:</strong></td>
                    <td>{adviser ? `${adviser.firstname} ${adviser.lastname}` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Gender</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.gender || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Email Address</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Home Address</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.homeAddress || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Contact No.</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.contactNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Emergency No.</strong></td>
                    <td><strong>:</strong></td>
                    <td>{selectedStudent?.emergencyNumber || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
          </div>    

          {/* Search Bar for Students */}
          <div className={styles['search-container']}>
            <label htmlFor="studentSearch">Search: </label>
            <input
              type="text"
              id="studentSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter student name or ID"
            />

            {/* Only show the student list if the searchQuery is not empty and filtered students exist */}
            {searchQuery && (
              <div>
                {filteredStudents.length > 0 ? (
                  <div className={formStyles['global-dropdown']}>
                    {filteredStudents.map((student) => (
                      <div
                        key={student.sid} 
                        onClick={() => handleStudentSelect(student)} // Dropdown disappears after selection
                        className={formStyles['global-dropdown-item']}>
                        {student.name} ({student.sid})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={formStyles['global-dropdown']}>No students found.</p>
                )}
              </div>
            )}  
            
          </div>    
        </div>   

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            schoolYears={schoolYears}
          />
        )}

        {showAddStudentModal && ( 
          <AddStudentModal
            open={showAddStudentModal}
            onClose={() => setShowAddStudentModal(false)}
          />    
        )}
      
        {/* Add Record Modal */}
        {showAddRecordModal && (
          <AddRecordModal
            student={selectedStudent}
            onClose={() => setShowAddRecordModal(false)}
            refreshRecords={() => fetchStudentRecords(selectedStudent.sid)} // Pass the refresh function
          />
        )}                

        {/* Display records if student is selected */}
        {selectedStudent && (
          <>
            {/* Use RecordFilter component to filter by school year, month, week */}
            <div className={styles['filter-container']}>
              {selectedStudent && (
                <RecordFilter
                  schoolYears={schoolYears}
                  loggedInUser={loggedInUser}
                  selectedSchoolYear={selectedSchoolYear}
                  setSelectedSchoolYear={setSelectedSchoolYear}
                  selectedSection={null} // Pass null or undefined since we don't want section filter
                  setSelectedSection={() => {}} // Empty setter for section
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  selectedWeek={selectedWeek}
                  setSelectedWeek={setSelectedWeek}
                  showGradeAndSection={false} // Hide grade and section filters
                />
              )}    
            </div>         
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Detailed Records</h2>
              {selectedStudent && loggedInUser?.userType === 1 && (
                <button
                  className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`} 
                  onClick={() => setShowAddRecordModal(true)}
                >
                  <AddIcon /> Add Record
                </button>
              )}
            </div>
                        
            <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table']}>
              <thead>
                <tr>
                  <th>Record Date</th>
                  <th>Monitored Record</th>
                  <th>Type</th>
                  {/* <th>Sanction</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.recordId}>
                      <td>{record.record_date}</td>
                      <td>{record.monitored_record}</td>
                      <td>{record.type === 1 ? 'Record' : record.type === 2 ? 'Case' : 'Unknown'}</td>
                      {/* <td>{record.sanction}</td> */}
                      <td>
                        <ViewNoteIcon
                          onClick={() => {
                            setRecordToView(record); // Set the record to view
                            setShowViewRecordModal(true); // Show the view modal
                          }}
                          className={formStyles['action-icon']}
                          style={{ marginRight: loggedInUser?.userType === 3 ? '0' : '15px' }}
                        />
                        {loggedInUser?.userType === 1 && (
                          <>
                            <EditNoteIcon
                              onClick={() => {
                                setRecordToEdit(record); // Set the record to edit
                                setShowEditRecordModal(true); // Show the edit modal
                              }}
                              className={formStyles['action-icon']}
                              style={{ marginRight: loggedInUser?.userType === 3 ? '0' : '15px' }}
                            />
                            <DeleteIcon
                              onClick={() => handleDeleteRecord(record.recordId)} // Call delete function
                              className={formStyles['action-icon']}
                            />
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
            {showEditStudentModal && (
              <EditStudentModal
                student={studentToEdit} // Pass the student to edit
                onClose={() => setShowEditStudentModal(false)} // Close handler
                refreshStudents={fetchStudents} // Pass the fetchStudents function to refresh data
              />
            )}      

            {/* Add the View Modal here */}
            {showViewRecordModal && (
              <RecordStudentViewModal
                record={recordToView} // Pass the record to view
                onClose={() => setShowViewRecordModal(false)} // Close handler
              />
            )}

            {showEditRecordModal && (
              <RecordStudentEditModal
                record={recordToEdit} // Pass the record to edit
                onClose={() => setShowEditRecordModal(false)} // Close handler
              />
            )}     
          </>
        )}
      </div>
    </div>
  );
};

export default Student;
