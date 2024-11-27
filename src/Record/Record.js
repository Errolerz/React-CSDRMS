import React, { useEffect, useState } from 'react';
import axios from 'axios';

import styles from './Record.module.css';
import navStyles from '../Navigation.module.css';
import tableStyles from '../GlobalTable.module.css';
import Navigation from '../Navigation';

import AddRecordModal from '../Student/RecordStudentAddModal';
import RecordStudentEditModal from '../RecordStudentEditModal';
import RecordStudentViewModal from '../RecordStudentViewModal';

const Record = () => {
  const [records, setRecords] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false); // State for View modal visibility
  const [showAddModal, setShowAddModal] = useState(false); // State for Add modal visibility
  const [showEditModal, setShowEditModal] = useState(false); // State for Edit modal visibility
  const [selectedRecord, setSelectedRecord] = useState(null); // State for selected record
  const [filterType, setFilterType] = useState('All'); // 'All', 'Reported', 'Non-Reported'

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
        encoderId: loggedInUser.userId 
      };
    } else if ([5, 6, 2].includes(loggedInUser.userType)) {
      url = 'http://localhost:8080/record/getAllRecordsByEncoderId';
      params = {
        encoderId: loggedInUser.userId // Adjust as needed
      };
    } else if (loggedInUser.userType === 1) {
      url = 'http://localhost:8080/record/getAllRecords';
    }
  
    if (url) {
      axios
        .get(url, { params }) // Pass query parameters dynamically
        .then((response) => {
          // Sort records by recordId in descending order
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

  const filterRecords = () => {
    if (filterType === 'Reported') {
      return records.filter(record => record.complainant && record.complainant !== 'N/A');
    } else if (filterType === 'Non-Reported') {
      return records.filter(record => !record.complainant || record.complainant === 'N/A');
    }
    return records; // 'All' case, no filtering
  };
  
  
  

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };
  
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };
  

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      axios
        .delete(`http://localhost:8080/record/delete/${recordId}/${loggedInUser.userId}`)
        .then(() => {
          alert('Record deleted successfully.');
          fetchRecords(); // Refresh the list after deletion
        })
        .catch((error) => {
          console.error('Error deleting record:', error);
          alert('Failed to delete record. Please try again.');
        });
    }
  };
  

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>All Records</h2>
        </div>

        <div className={styles.filterContainer}>
         <label>Filter by Record or Case:
            <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
              <option value="All">All Records</option>
              <option value="Reported">Reported</option>
              <option value="Non-Reported">Non-Reported</option>
            </select>
          </label>
        </div>
        
        <div className={tableStyles['table-container']}>
          <table className={tableStyles['global-table']}>
            <thead>
              <tr>
                <th>Record ID</th>
                
                <th>Record Date</th>
                <th>Incident Date</th>
                <th>Time</th>
                <th>Monitored Record</th>
                <th>Remarks</th>
                <th>Sanction</th>
                <th>Complainant</th>
                <th>Case Details</th>
                <th>Complete</th>
                <th>Encoder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterRecords().map((record) => (
                <tr key={record.recordId}>
                  <td>{record.recordId}</td>
                 
                  <td>{record.record_date}</td>
                  <td>{record.incident_date}</td>
                  <td>{record.time}</td>
                  <td>{record.monitored_record}</td>
                  <td>{record.remarks}</td>
                  <td>{record.sanction}</td>
                  <td>{record.complainant ? record.complainant : 'N/A'}</td>
                  <td>{record.caseDetails}</td>
                  <td>
                    {record.complete === 0
                      ? 'Incomplete'
                      : record.complete === 1
                      ? 'Complete'
                      : 'N/A'}
                  </td>
                  <td>{record.encoder.firstname} {record.encoder.lastname}</td>
                  <td>
                    <button
                      className={tableStyles['view-button']}
                      onClick={() => openViewModal(record)}
                    >
                      View
                    </button>

                    {record.complainant && record.complainant !== 'N/A' ? (
                        <button
                          className={tableStyles['investigate-button']} // Use a specific style if desired
                          onClick={() => openEditModal(record)} // Repurposed for investigating
                        >
                          Investigate
                        </button>
                      ) : (
                        <button
                          className={tableStyles['edit-button']}
                          onClick={() => openEditModal(record)}
                        >
                          Edit
                        </button>
                      )}
                    <button
                      className={tableStyles['delete-button']}
                      onClick={() => handleDelete(record.recordId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className={`${tableStyles['global-button']} ${tableStyles['add-record-button']}`}
          onClick={openAddModal}
        >
          Add New Record
        </button>
      </div>
      {showViewModal && selectedRecord && (
        <RecordStudentViewModal record={selectedRecord} onClose={closeViewModal} />
      )}
      {showAddModal && (
        <AddRecordModal onClose={closeAddModal} refreshRecords={fetchRecords} />
      )}
      {showEditModal && selectedRecord && (
        <RecordStudentEditModal
          record={selectedRecord}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
};

export default Record;
