import React, { useState, useEffect } from 'react';
import styles from './PeriodDetailModal.module.css';
import buttonStyles from '../GlobalButton.module.css';

const options = [
  'Absent',
  'Tardy',
  'Cutting Classes',
  'Improper Uniform',
];

const PeriodDetailModal = ({ student, period, initialRecord, initialRemarks, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    // Initialize state with either passed initial values or empty defaults
    setSelectedOptions(initialRecord || []);
    setRemarks(initialRemarks || '');
  }, [initialRecord, initialRemarks, student.id, period]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevOptions) =>
      prevOptions.includes(option)
        ? prevOptions.filter(item => item !== option)
        : [...prevOptions, option]
    );
  };

  const isEmpty = selectedOptions.length === 0 && remarks.trim() === '';

  const handleSubmit = () => {
    // If there's data, save it and pass it back to the parent component
    if (!isEmpty) {
      onClose(selectedOptions, remarks);
    } else {
      // Consider what should happen if submit is pressed with empty inputs
      onClose([], '');
    }
  };

  const handleClear = () => {
    // Submit empty data, indicating removal of any existing records
    onClose([], '');
  };

  const handleClose = () => {
    // Close without saving any changes
    onClose(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 style={{ color: '#8A252C' }}>Period {period} - {student.name}</h3>
        <div className={styles.checkboxContainer}>
          {options.map((option) => (
            <label key={option} className={styles.checkboxItem}>
              <input 
                type="checkbox" 
                checked={selectedOptions.includes(option)} 
                onChange={() => handleCheckboxChange(option)} 
              />
              {option}
            </label>
          ))}
        </div>

        <div className={styles.remarksContainer}>
          <label htmlFor="remarks">Remarks:</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks here"
          />
        </div>

        <div className={buttonStyles['button-group']}>
          <button
            onClick={handleSubmit}
            disabled={isEmpty}
            className={`${buttonStyles['action-button']} ${
              isEmpty ? buttonStyles['gray-button'] : buttonStyles['green-button']
            }`}
          >
            Submit
          </button>
          <button
            onClick={handleClear}
            className={`${buttonStyles['action-button']} ${buttonStyles['yellow-button']}`}
          >
            Clear
          </button>
          <button
            onClick={handleClose}
            className={`${buttonStyles['action-button']} ${buttonStyles['red-button']}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodDetailModal;
