import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './StudentList.module.css'; // Updated CSS for table container
import navStyles from '../Components/Navigation.module.css'; // Assuming this is where your nav styles are stored
import buttonStyles from '../GlobalButton.module.css';

import Navigation from '../Components/Navigation';
import ImportModal from './ImportStudentModal'; // Import ImportModal component
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import StudentDetailsModal from './StudentDetailsModal'; // Import the modal
import Loader from '../Loader';

import AddStudentIcon from '@mui/icons-material/PersonAdd';
import ImportIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 


const StudentList = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('authToken'));

  const [students, setStudents] = useState([]); // Initialize as an empty array
  const [schoolYears, setSchoolYears] = useState([]); // School years state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [studentsPerPage] = useState(7); // Limit number of students per page
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // Store the selected student
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);

  // New states for filtering by grade and section
  const [grades, setGrades] = useState([]); // Available grades
  const [sections, setSections] = useState([]); // Sections based on selected grade
  const [selectedGrade, setSelectedGrade] = useState(''); // Selected grade
  const [selectedSection, setSelectedSection] = useState(''); // Selected section
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(''); // Selected school year


  const fetchStudents = useCallback(async () => {
    if (!loggedInUser) return;

    try {
      let response;
      const userType = loggedInUser.userType;

      if (userType === 1 || userType === 4) {
        // Admin: Fetch all current students
        response = await axios.get('http://localhost:8080/student/getAllCurrentStudents');
      } else if (userType === 3){
        // Adviser: Fetch students based on grade, section, and school year
        response = await axios.get('http://localhost:8080/student/getAllStudentsByAdviser', { 
          params: {
            grade: loggedInUser.grade,
            section: loggedInUser.section,
            schoolYear: loggedInUser.schoolYear
          }
        });
      }
      

      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
      setStudents([]);
      setIsLoading(false);
    }
  }, [loggedInUser]);

  const fetchSchoolYears = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
      if (Array.isArray(response.data)) {
        setSchoolYears(response.data);
      } else {
        setSchoolYears([]);
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
      setSchoolYears([]);
    }
  }, []);

  const fetchGradesAndSections = useCallback(async () => {
    try {
      // Fetch available grades
      const gradeResponse = await axios.get('http://localhost:8080/class/allUniqueGrades');
      setGrades(gradeResponse.data);

      // Fetch sections for the selected grade
      if (selectedGrade) {
        const sectionResponse = await axios.get(`http://localhost:8080/class/sections/${selectedGrade}`);
        setSections(sectionResponse.data);
      }
    } catch (error) {
      console.error('Error fetching grades or sections:', error);
    }
  }, [selectedGrade]);

  useEffect(() => {
    fetchStudents();
    fetchSchoolYears();
    fetchGradesAndSections();
  }, [fetchGradesAndSections]);

  useEffect(() => {
    if (!loggedInUser) return;

    console.log('loggedInUser.userType:', loggedInUser?.userType); // Debug log

    const userTypeTitles = {
        1: 'SSO',
        3: 'Adviser',
        4: 'Admin',
    };

    const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
    document.title = `${userTypeTitle} | Student List`;
    }, []);

  // Filter students based on search query, grade, and section
  const filteredStudents = students
    .filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        student.sid.toString().toLowerCase().includes(searchLower) ||
        student.name.toLowerCase().includes(searchLower) ||
        `${student.grade} - ${student.section}`.toLowerCase().includes(searchLower) ||
        student.gender.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.emergencyNumber.toLowerCase().includes(searchLower);

      const matchesGrade = selectedGrade ? student.grade === parseInt(selectedGrade) : true;
      const matchesSection = selectedSection ? student.section.toUpperCase() === selectedSection.toUpperCase() : true;
      const matchesSchoolYear = selectedSchoolYear ? student.schoolYear === selectedSchoolYear : true; // School year match

      return matchesSearch && matchesGrade && matchesSection && matchesSchoolYear;
    })
    .sort((a, b) => {
      // 1. Sort by gender: male comes first
      if (a.gender.toLowerCase() === 'male' && b.gender.toLowerCase() !== 'male') return -1;
      if (a.gender.toLowerCase() !== 'male' && b.gender.toLowerCase() === 'male') return 1;

      // 2. If gender is the same, sort by first name (alphabetically)
      const nameA = a.name.split(' ')[0].toLowerCase(); // Extract first name and convert to lowercase
      const nameB = b.name.split(' ')[0].toLowerCase(); // Extract first name and convert to lowercase
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      // 3. Sort by grade in ascending order if both gender and first name are the same
      return a.grade - b.grade;
    });

  const handleEditStudent = (student) => {
    setShowAddStudentModal(false); // Close the Add Student modal if open
    setShowImportModal(false); // Close the Import Modal if open
    setShowEditStudentModal(true); // Open the Edit Student modal
    setSelectedStudent(student); // Set the student data for editing
  };
  
  const handleDeleteStudent = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/student/delete/${id}/${loggedInUser.userId}`);
        fetchStudents(); // Refresh student list after deletion
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student.');
      }
    }
  };
  

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>Student List</h2>
          <div className={buttonStyles['button-group']} style={{ marginTop: '0' }}>
            {loggedInUser.userType !== 3 && (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
                >
                  <ImportIcon />
                  Import Students
                </button>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
                >
                  <AddStudentIcon />
                  Add Student
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className={styles['filter-container']}>
          <label>Filter by: 
            {loggedInUser?.userType !== 3 && (
              <select
                value={selectedSchoolYear}
                onChange={(e) => setSelectedSchoolYear(e.target.value)}
              >
                <option value="">Select School Year</option>
                {schoolYears.map((year) => (
                  <option key={year.schoolYear_ID} value={year.schoolYear}>
                    {year.schoolYear} {/* Make sure to use the correct property */}
                  </option>
                ))}
              </select>
            )}

            {/* Grade Filter */}
            {loggedInUser?.userType === 3 ? (
              // If the user is an Adviser, show their grade as a disabled option
              <select value={loggedInUser.grade} disabled>
                <option value={loggedInUser.grade}>Grade {loggedInUser.grade}</option>
              </select>
            ) : (
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedSection(''); // Reset section when grade changes
                }}
                disabled={loggedInUser?.userType === 3}
              >
                <option value="">Select Grade</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            )}

            {/* Section Filter (visible only after grade is selected) */}
            {loggedInUser?.userType === 3 ? (
              // If the user is an Adviser, show their section as a disabled option
              <select value={loggedInUser.section} disabled>
                <option value={loggedInUser.section}>{loggedInUser.section}</option>
              </select>
            ) : selectedGrade ? (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={loggedInUser?.userType === 3}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section.toUpperCase()}
                  </option>
                ))}
              </select>
            ) : null}


          </label>

          <div>
            <div className={styles['search-container']}>
              <SearchIcon className={styles['search-icon']} />
              <input
                type="search"
                className={styles['search-input']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
              />
            </div>
          </div>
        </div>

        <div className={styles['student-list-table-container']}>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <p className={styles['error-message']}>{error}</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
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
                      <td>
                        <ViewNoteIcon
                          className={buttonStyles['action-icon']}
                          onClick={() => {
                            setSelectedStudent(student); // Set the selected student
                            setShowStudentDetailsModal(true); // Open the modal
                          }}
                        />
                        {loggedInUser?.userType !== 3 && (
                          <>
                            <EditNoteIcon
                              className={buttonStyles['action-icon']}
                              onClick={() => handleEditStudent(student)}
                            />
                            <DeleteIcon
                              className={buttonStyles['action-icon']}
                              onClick={() => handleDeleteStudent(student.id)}
                            />
                          </>
                        )}
                      </td>
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
              disabled={indexOfLastStudent >= filteredStudents.length}
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
        {showEditStudentModal && selectedStudent && (
          <EditStudentModal
            student={selectedStudent}
            onClose={() => setShowEditStudentModal(false)}
            refreshStudents={fetchStudents}
          />
        )}

        {showStudentDetailsModal && selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            loggedInUser={loggedInUser} // Pass the loggedInUser
            onClose={() => setShowStudentDetailsModal(false)}
          />
        )}

      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default StudentList;
