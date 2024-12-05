import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import styles from './StudentList.module.css'; // Updated CSS for table container
import navStyles from '../Navigation.module.css'; // Assuming this is where your nav styles are stored
import buttonStyles from '../GlobalButton.module.css';

import ImportModal from './StudentImportModal'; // Import ImportModal component
import AddStudentModal from './AddStudentModal';

import AddStudentIcon from '@mui/icons-material/PersonAdd';
import ImportIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import Navigation from '../Navigation';

const StudentList = () => {
  // Retrieve loggedInUser from localStorage or handle if it's not available
  const loggedInUser = JSON.parse(localStorage.getItem('authToken'));

  const [students, setStudents] = useState([]); // Initialize as an empty array
  const [schoolYears, setSchoolYears] = useState([]); // School years state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [studentsPerPage] = useState(10); // Limit number of students per page
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch students from API based on userType and loggedInUser info
  const fetchStudents = useCallback(async () => {
    if (!loggedInUser) return; // Avoid fetching if loggedInUser is not available

    try {
      let response;
      const userType = loggedInUser.userType;

      if (userType === 4) {
        // Fetch all students for admin
        response = await axios.get(
          'http://localhost:8080/student/getAllCurrentStudents'
        );
      }

      // Ensure response.data is an array before setting the state
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]); // Default to empty array if data is not an array
      }

      setIsLoading(false); // Set loading state to false once data is fetched
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
      setStudents([]); // Set to empty array on error
      setIsLoading(false); // Set loading state to false if an error occurs
    }
  }, [loggedInUser]);

  // Fetch school years from API
  const fetchSchoolYears = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/school-year'); // API to fetch school years
      if (Array.isArray(response.data)) {
        setSchoolYears(response.data);
      } else {
        setSchoolYears([]); // Default to empty array if no school years
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
      setSchoolYears([]); // Set to empty array on error
    }
  }, []);

  // Fetch students and school years when the component mounts or loggedInUser changes
  useEffect(() => {
    fetchStudents();
    fetchSchoolYears();
  }, [fetchStudents, fetchSchoolYears]);

  // Filter students based on search query, including all fields
  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.sid.toString().toLowerCase().includes(searchLower) || // Search in ID Number
      student.name.toLowerCase().includes(searchLower) || // Search in Name
      `${student.grade} - ${student.section}`.toLowerCase().includes(searchLower) || // Search in Grade & Section
      student.gender.toLowerCase().includes(searchLower) || // Search in Gender
      student.email.toLowerCase().includes(searchLower) || // Search in Email
      student.emergencyNumber.toLowerCase().includes(searchLower) // Search in Contact No.
    );
  });

  // Get current students based on the page number
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>Student List</h2>
        </div>
        <div className={styles['separator']}>
          <div className={styles['search-container']}>
            <SearchIcon className={styles['search-icon']} />
            <input
              type="search"
              className={styles['search-input']}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Handle search input change
              placeholder="Search"
            />
          </div>

          <div className={buttonStyles['button-group']} style={{ marginTop: '0' }}>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
            >
              <AddStudentIcon />
              Add Student
            </button>

            {/* Button to open Import Modal */}
            <button
              onClick={() => setShowImportModal(true)}
              className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
            >
              <ImportIcon />
              Import Student
            </button>
          </div>
        </div>
        <div className={styles['student-list-table-container']}>
          {isLoading ? (
            <p>Loading students...</p> // Loading state indicator
          ) : error ? (
            <p className={styles['error-message']}>{error}</p> // Error state
          ) : (
            <table className={styles['student-list-table']}>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Grade & Section</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Contact No.</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles['no-data']}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student.sid} className={styles['student-row']}>
                      <td>{student.sid}</td>
                      <td>{student.name}</td>
                      <td>
                        {student.grade} - {student.section}
                      </td>
                      <td>{student.gender}</td>
                      <td>{student.email}</td>
                      <td>{student.emergencyNumber}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          <div className={styles['pagination']}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ArrowBackIcon />
            </button>
            <span>
              Page {currentPage} of{' '}
              {Math.ceil(filteredStudents.length / studentsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
            >
              <ArrowForwardIcon />
            </button>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <AddStudentModal
            onClose={() => setShowAddStudentModal(false)}
            onStudentAdded={fetchStudents} // Fetch students after adding
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            schoolYears={schoolYears} // Pass schoolYears to ImportModal
          />
        )}
      </div>
    </div>
  );
};

export default StudentList;
