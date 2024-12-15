import React, { useState } from 'react';
import axios from 'axios';
import styles from './ImportStudentModal.module.css'; // Import the updated CSS
import formStyles from '../GlobalForm.module.css'; // Importing GlobalForm styles
import Loader from '../Loader';

const ImportModal = ({ onClose, schoolYears = [] }) => {
  const [file, setFile] = useState(null);
  const [importSchoolYear, setImportSchoolYear] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file || !importSchoolYear) {
      alert('Please select a file and school year.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('schoolYear', importSchoolYear);

    setLoading(true); // Set loading to true
    try {
      await axios.post('http://localhost:8080/student/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully');
      window.location.reload(); // Refresh the page after successful upload
      onClose(); // Close the modal after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className={styles['student-modal-overlay']}>
      <div className={styles['student-import-modal-content']}>
        <h2 className={styles['student-modal-header']}>Import Student Data</h2>

        {loading ? (
          <Loader />
        ) : (
          <>
            <label htmlFor="importSchoolYear">Select School Year for Import:</label>
            <select
              id="importSchoolYear"
              className={styles['student-modal-select']}
              value={importSchoolYear}
              onChange={(e) => setImportSchoolYear(e.target.value)}
            >
              <option value="">Select School Year</option>
              {schoolYears && schoolYears.length > 0 ? (
                schoolYears.map((year) => (
                  <option key={year.schoolYear_ID} value={year.schoolYear}>
                    {year.schoolYear}
                  </option>
                ))
              ) : (
                <option disabled>No school years available</option>
              )}
            </select>

            <input
              type="file"
              className={styles['student-modal-file-input']}
              onChange={handleFileChange}
            />

            <div className={formStyles['global-buttonGroup']}>
              <button
                className={formStyles['green-button']}
                onClick={handleFileUpload}
              >
                Import  
              </button>
              <button
                className={`${formStyles['green-button']} ${formStyles['red-button']}`}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
