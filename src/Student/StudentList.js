import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './StudentList.module.css'; // Updated CSS for table container
import navStyles from '../Navigation.module.css'; // Assuming this is where your nav styles are stored
import buttonStyles from '../GlobalButton.module.css';

import ImportModal from './StudentImportModal'; // Import ImportModal component
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';

import AddStudentIcon from '@mui/icons-material/PersonAdd';
import ImportIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 

import Navigation from '../Navigation';

const StudentList = () => {
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
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null); // Store the selected student


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

      if (userType === 4) {
        response = await axios.get(
          'https://spring-csdrms-g8ra.onrender.com/student/getAllCurrentStudents'
        );
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
      const response = await axios.get('https://spring-csdrms-g8ra.onrender.com/schoolYear/getAllSchoolYears');
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
      const gradeResponse = await axios.get('https://spring-csdrms-g8ra.onrender.com/class/allUniqueGrades');
      setGrades(gradeResponse.data);

      // Fetch sections for the selected grade
      if (selectedGrade) {
        const sectionResponse = await axios.get(`https://spring-csdrms-g8ra.onrender.com/class/sections/${selectedGrade}`);
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

  // Filter students based on search query, grade, and section
  const filteredStudents = students.filter((student) => {
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
        await axios.delete(`https://spring-csdrms-g8ra.onrender.com/student/delete/${id}/${loggedInUser.userId}`);
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
        </div>

        <div className={styles['separator']}>
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

          <div className={buttonStyles['button-group']} style={{ marginTop: '0' }}>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
            >
              <AddStudentIcon />
              Add Student
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
            >
              <ImportIcon />
              Import Student
            </button>
          </div>
        </div>

        <div className={styles['filters']}>
        <div className={styles['filter-item']}>
          <label>School Year</label>
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

        </div>

          {/* Grade Filter */}
          <div className={styles['filter-item']}>
            <label>Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection(''); // Reset section when grade changes
              }}
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter (visible only after grade is selected) */}
          {selectedGrade && (
            <div className={styles['filter-item']}>
              <label>Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles['student-list-table-container']}>
          {isLoading ? (
            <p>Loading students...</p>
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
                        <EditNoteIcon
                          className={buttonStyles['action-icon']}
                          onClick={() => handleEditStudent(student)}
                        />
                        <DeleteIcon
                          className={buttonStyles['action-icon']}
                          onClick={() => handleDeleteStudent(student.id)}
                        />
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

      </div>
    </div>
  );
};

export default StudentList;
