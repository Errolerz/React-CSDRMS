import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RecordFilter from './RecordFilter'; // Import RecordFilter component
import AddRecordModal from './RecordStudentAddModal'; // Import AddRecordModal component
import ImportModal from './RecordStudentImportModal'; // Import ImportModal component
import styles from './Record.module.css'; // Importing CSS module
import navStyles from './Navigation.module.css'; 
import Navigation from './Navigation';
import formStyles from './GlobalForm.module.css'; // Importing GlobalForm styles
import tableStyles from './GlobalTable.module.css'; // Importing GlobalForm styles
import EditStudentModal from './EditStudentModal'; // Ensure this path matches the actual file location
import RecordStudentEditModal from './RecordStudentEditModal';
import RecordStudentViewModal from './RecordStudentViewModal'; // Import the view modal
import AddStudentModal from './Adviser/AddStudentModal';
import EditNoteIcon from '@mui/icons-material/Edit';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon


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
    'Sanction',
  ];

  const fetchStudents = async () => {
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
  };

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
  }, []);
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
      const response = await axios.get(`http://localhost:8080/student-record/getStudentRecords/${sid}`);
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
        await axios.delete(`http://localhost:8080/student-record/delete/${recordId}/${loggedInUser.userId}`); // Call your delete API
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
        </div>  
        <div className={styles['triple-container']}>
          {/* Display selected student details */}
          
          <div className={styles['details-container']}> 
            <label style={{ display: 'flex', justifyContent: 'space-between' }}> Details:
              {selectedStudent && (
                <div className={formStyles['global-buttonGroup']}>
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
                  <td><strong>Contact No.</strong></td>
                  <td><strong>:</strong></td>
                  <td>{selectedStudent?.contactNumber || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>    

          {/* Search Bar for Students */}
          <div className={styles['search-container']}>
            <h2 className={styles['h2-title-record']}>Total Frequency of Monitored Records</h2>
            <div className={tableStyles['table-container']}>
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
            <label htmlFor="studentSearch">Search: </label>
            <input
              type="text"
              id="studentSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter student name or ID"
            />

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
            
            {/* Button to open Import Modal */}
            {loggedInUser?.userType !== 3 && (
              <button onClick={() => setShowImportModal(true)} 
                className={`${formStyles['green-button']} ${formStyles['maroon-button']}`} 
                style={{ marginLeft: '20px' }}>
                Import Students
              </button>
            )}      

            {loggedInUser?.userType !== 3 && (
              <button onClick={() => setShowAddStudentModal(true)} 
                className={formStyles['green-button']} 
                style={{ marginLeft: '10px' }}>
                Add Student
              </button>
            )}           

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
                  className={`${formStyles['green-button']} ${formStyles['orange-button']}`} 
                  onClick={() => setShowAddRecordModal(true)}
                >
                  Add Record
                </button>
              )}
            </div>
                        
            <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table']}>
              <thead>
                <tr>
                  <th>Record Date</th>
                  <th>Monitored Record</th>
                  <th style={{ width: '40%'}}>Remarks</th>
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
                      <td style={{ width: '40%'}}>{record.remarks}</td>
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
