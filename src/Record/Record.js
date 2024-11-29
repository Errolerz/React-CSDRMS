import React, { useEffect, useState } from 'react';
import axios from 'axios';

import styles from './Record.module.css';
import navStyles from '../Navigation.module.css';
import tableStyles from '../GlobalTable.module.css';
import buttonStyles from '../GlobalButton.module.css';
import Navigation from '../Navigation';

import AddRecordModal from '../Student/AddStudentRecordModal';
import RecordStudentEditModal from '../RecordStudentEditModal';
import ViewRecordModal from '../ViewRecordModal';

import AddIcon from '@mui/icons-material/AddCircleOutline';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Record = () => {
  const [records, setRecords] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterType, setFilterType] = useState('All'); // Default filter is "All"
  const [caseStatusFilter, setCaseStatusFilter] = useState('All'); // Default to showing all cases

  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = () => {
    let url = '';
    let params = {};

    if (loggedInUser.userType === 3) {
      url = 'http://localhost:8080/record/getRecordsByAdviser';
      params = {
        grade: loggedInUser.grade,
        section: loggedInUser.section,
        schoolYear: loggedInUser.schoolYear,
        encoderId: loggedInUser.userId,
      };
    } else if ([5, 6, 2].includes(loggedInUser.userType)) {
      url = 'http://localhost:8080/record/getAllRecordsByEncoderId';
      params = {
        encoderId: loggedInUser.userId,
      };
    } else if (loggedInUser.userType === 1) {
      url = 'http://localhost:8080/record/getAllRecords';
    }

    if (url) {
      axios
        .get(url, { params })
        .then((response) => {
          const sortedRecords = response.data.sort((a, b) => b.recordId - a.recordId);
          setRecords(sortedRecords);
        })
        .catch((error) => {
          console.error('Error fetching records:', error);
        });
    } else {
      console.error('Invalid user type: Unable to fetch records.');
    }
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);
  const openEditModal = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setSelectedRecord(null);
    setShowEditModal(false);
  };
  const openViewModal = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };
  const closeViewModal = () => {
    setSelectedRecord(null);
    setShowViewModal(false);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      axios
        .delete(`http://localhost:8080/record/delete/${recordId}/${loggedInUser.userId}`)
        .then(() => {
          alert('Record deleted successfully.');
          fetchRecords();
        })
        .catch((error) => {
          console.error('Error deleting record:', error);
          alert('Failed to delete record. Please try again.');
        });
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filterType === 'All') return true; // Show all records
    if (filterType === 'Record') return record.type === 1;
    if (filterType === 'Case') {
      if (caseStatusFilter === 'Complete') return record.complete === 1;
      if (caseStatusFilter === 'Incomplete') return record.complete === 0;
      return record.type === 2; // "All" case filter
    }
    return false;
  });

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>
            {filterType === 'All'
              ? 'All Student Records & Cases'
              : filterType === 'Record'
              ? 'Student Records'
              : 'Student Cases'}
          </h2>
        </div>

        <div className={styles.filterContainer}>
          <label>
            View by:
            <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
              <option value="All">All</option>
              <option value="Record">Record</option>
              <option value="Case">Case</option>
            </select>

            {filterType === 'Case' && (
              <select
                onChange={(e) => setCaseStatusFilter(e.target.value)}
                value={caseStatusFilter}
              >
                <option value="All">All</option>
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            )}
          </label>

          <div>
            <button
              className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
              onClick={openAddModal}
            >
              <AddIcon /> Add Record
            </button>
          </div>
        </div>

        <div className={tableStyles['table-container']}>
          <table className={tableStyles['global-table']}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Recorded</th>
                <th>Monitored Record</th>
                <th>Type</th> {/* New column */}
                <th>Status</th> {/* Status column for Case */}
                <th>Encoder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.recordId}>
                    <td>{record.student.name}</td>
                    <td>{record.record_date}</td>
                    <td>{record.monitored_record || 'N/A'}</td>
                    <td>{record.type === 1 ? 'Record' : 'Case'}</td> {/* Determine type */}
                    <td
                      style={{
                        fontWeight: 'bold',
                        color:
                          record.complete === 0
                            ? '#e53935' // Red for Incomplete
                            : record.complete === 1
                            ? '#4caf50' // Green for Complete
                            : '#000', // Default color for N/A
                      }}
                    >
                      {record.complete === 0
                        ? 'Incomplete'
                        : record.complete === 1
                        ? 'Complete'
                        : 'N/A'}
                    </td>
                    <td>
                      {record.encoder.firstname} {record.encoder.lastname}
                    </td>
                    <td>
                      <ViewNoteIcon
                        className={buttonStyles['action-icon']}
                        onClick={() => openViewModal(record)}
                        style={{ marginRight: loggedInUser?.userType === 3 ? '0' : '15px' }}
                      />
                      <EditNoteIcon
                        className={buttonStyles['action-icon']}
                        onClick={() => openEditModal(record)}
                        style={{ marginRight: loggedInUser?.userType === 3 ? '0' : '15px' }}
                      />
                      <DeleteIcon
                        className={buttonStyles['action-icon']}
                        onClick={() => handleDelete(record.recordId)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles['no-records']}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showViewModal && selectedRecord && (
        <ViewRecordModal record={selectedRecord} onClose={closeViewModal} />
      )}
      {showAddModal && <AddRecordModal onClose={closeAddModal} refreshRecords={fetchRecords} />}
      {showEditModal && selectedRecord && (
        <RecordStudentEditModal
          record={selectedRecord}
          onClose={closeEditModal}
          refreshRecords={fetchRecords}
        />
      )}
    </div>
  );
};

export default Record;
