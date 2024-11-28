import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditStudentModal.module.css'; // Importing CSS module for the modal
import formStyles from '../GlobalForm.module.css'; // Import global form styles

const EditStudentModal = ({ student, onClose, refreshStudents }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const [formData, setFormData] = useState({
    sid: student.sid || '',
    name: student.name || '',
    grade: student.grade || '',
    section: student.section || '',
    gender: student.gender || '',
    email: student.email || '',
    homeAddress: student.homeAddress || '',
    contactNumber: student.contactNumber || '',
    emergencyNumber: student.emergencyNumber || '',
    schoolYear: student.schoolYear || '',
    current: student.current || 1,
  });


  const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);

    useEffect(() => {
        // Fetch available grades and school years when modal opens
        const fetchData = async () => {
          try {
            const gradesResponse = await axios.get('http://localhost:8080/class/allUniqueGrades');
            setGrades(gradesResponse.data);
    
            const schoolYearsResponse = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
            setSchoolYears(schoolYearsResponse.data);
    
            // Fetch sections for the current grade
            if (formData.grade) {
              const sectionsResponse = await axios.get(`http://localhost:8080/class/sections/${formData.grade}`);
              setSections(sectionsResponse.data);
            }
          } catch (error) {
            console.error('Error fetching dynamic data:', error);
          }
        };
    
        fetchData();
      }, [formData.grade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'grade') {
        fetchSections(value);
      }
  };

  const fetchSections = async (grade) => {
    try {
      const response = await axios.get(`http://localhost:8080/class/sections/${grade}`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/student/update/${student.id}/${loggedInUser.userId}`, formData); // Update API endpoint
      refreshStudents(); // Refresh the student list after update
      window.location.reload();
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  return (
    <div className={styles['student-modal-overlay']}>
      <div className={styles['student-add-modal-content']}>
        <h2>Edit Student</h2>
        <form onSubmit={handleSubmit} className={formStyles['form-container']}>
          <div className={formStyles['form-group']}>
            <label htmlFor="sid">Student ID:</label>
            <input
              type="text"
              id="sid"
              name="sid"
              value={formData.sid}
              onChange={handleChange}
              placeholder="Student ID"
              readOnly // Make read-only if SID should not be editable
            />
          </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Lastname, Firstname Middle..."
            />
          </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="grade">Grade:</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            >
                 <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="section">Section:</label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
            >
                  <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className={formStyles['form-group']}>
                <label htmlFor="email">Email Address:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                />
            </div>
            <div className={formStyles['form-group']}>
                <label htmlFor="homeAddress">Home Address:</label>
                <input
                    type="text"
                    id="homeAddress"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    placeholder="Enter Home Address"
                />
            </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="contactNumber">Contact Number:</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter Contact Number"
            />
          </div>
          <div className={formStyles['form-group']}>
              <label htmlFor="contactNumber">Emergency Number:</label>
              <input
                  type="text"
                  id="emergencyNumber"
                  name="emergencyNumber"
                  value={formData.emergencyNumber}
                  onChange={handleChange}
                  placeholder="Enter Emegency Number"
              />
          </div>
          <div className={formStyles['form-group']}>
            <label htmlFor="schoolYear">School Year:</label>
            <select
              id="schoolYear"
              name="schoolYear"
              value={formData.schoolYear}
              onChange={handleChange}
              placeholder="Enter School Year"
            >
                <option value="">Select School Year</option>
              {schoolYears.map((sy) => (
                <option key={sy.schoolYear_ID} value={sy.schoolYear}>
                  {sy.schoolYear}
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles['global-buttonGroup']}>
            <button type="submit" className={formStyles['green-button']}>Save</button>
            <button type="button" onClick={onClose} className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
