import React, { useEffect, useState } from 'react';
import axios from 'axios';

import styles from './Record.module.css';
import navStyles from '../Components/Navigation.module.css';
import buttonStyles from '../GlobalButton.module.css';
import Navigation from '../Components/Navigation';

import AddRecordModal from './AddRecordModal';
import RecordStudentEditModal from './EditRecordModal';
import ViewRecordModal from './ViewRecordModal';
import AddLogBookModal from './AddLogBookModal'; 
import ImportRecordModal from './ImportRecordModal';

import AddIcon from '@mui/icons-material/AddCircleOutline';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImportIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import Loader from '../Loader';

const Record = () => { 
  const [records, setRecords] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false); // State for Import Record Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddLogBookModal, setShowAddLogBookModal] = useState(false); // ✅ State for AddLogBookModal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterType, setFilterType] = useState('All'); // Default filter is "All"
  const [monitoredRecordFilter, setMonitoredRecordFilter] = useState('All');
  const [caseStatusFilter, setCaseStatusFilter] = useState('All'); // Default to showing all cases
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const recordsPerPage = 50; // Number of items per page

  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  useEffect(() => {
    if (!loggedInUser) return;

    console.log('loggedInUser.userType:', loggedInUser?.userType); // Debug log

    const userTypeTitles = {
      1: 'SSO',
      2: 'Principal',
      3: 'Adviser',
      5: 'Teacher',
      6: 'Guidance',
    };
  
    const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
    document.title = `${userTypeTitle} | Record`;
  }, [loggedInUser]);

  useEffect(() => {
    if ([5, 6].includes(loggedInUser?.userType)) {
      setFilterType('Complaint');
    }

    fetchRecords();
  }, []);
  
  const fetchRecords = () => {
    setLoading(true); // Show loading before fetch starts
    let url = '';
    let params = {};

    if (loggedInUser.userType === 3) {
      url = 'http://localhost:8080/record/getRecordsByAdviser';
      params = {
        grade: loggedInUser.grade,
        section: loggedInUser.section,
        schoolYear: loggedInUser.schoolYear,
        userId: loggedInUser.userId,
      };
    } else if ([5, 6, 2].includes(loggedInUser.userType)) {
      url = 'http://localhost:8080/record/getAllRecordsByUserId';
      params = {
        userId: loggedInUser.userId,
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
        })
          .finally(() => {
            setLoading(false); // Ensure loading is turned off
          });
    } else {
      console.error('Invalid user type: Unable to fetch records.');
      setLoading(false); // Ensure loading is turned off even if URL is invalid
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

  const openAddLogBookModal = () => setShowAddLogBookModal(true); 
  const closeAddLogBookModal = () => setShowAddLogBookModal(false); 

  const openImportModal = () => setShowImportModal(true); // Open import modal
  const closeImportModal = () => setShowImportModal(false); // Close import modal

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

  const monitoredRecordsList = [
    'Absent',
    'Tardy',
    'Cutting Classes',
    'Improper Uniform',
    'Offense',
    'Misbehavior',
    'Clinic',
    ...(loggedInUser.userType !== 2 ? ['Lost/Found Items', 'Request ID', 'Request Permit'] : []),
    'TBD',
  ];

  // Filter the records based on the selected filters
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student.sid.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by monitored record type
    const matchesMonitoredRecord =
      monitoredRecordFilter === 'All' || record.monitored_record === monitoredRecordFilter;

    if (filterType === 'All') {
      return matchesSearch && matchesMonitoredRecord;
    }

    if (filterType === 'Log Book') {
      return record.source === 1 && matchesSearch && matchesMonitoredRecord;
    }

    if (filterType === 'Complaint') {
      if (caseStatusFilter === 'Complete') return record.complete === 1 && matchesSearch && matchesMonitoredRecord;
      if (caseStatusFilter === 'Incomplete') return record.complete === 0 && matchesSearch && matchesMonitoredRecord;
      return record.source === 2 && matchesSearch && matchesMonitoredRecord;
    }

    if (filterType === 'N/A') {
      return record.source === 0 && matchesSearch && matchesMonitoredRecord; // Assuming "N/A" maps to `source === 0`
    }

    return false;
  });

  // Pagination logic: Slice the filtered records based on the current page
  const totalRecords = filteredRecords.length; // Total number of filtered records
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice the records for the current page
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };  

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />
      <div
        className={`${navStyles.content} ${
          loggedInUser?.userType === 5 ? navStyles['content-teacher'] : ''
        }`}
      >
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>
            {filterType === 'All'
              ? loggedInUser?.userType === 3
                ? 'Your Student Records'
                : 'All Student Records'
              : filterType === 'Log Book'
              ? 'Student Records From Log Book'
              : loggedInUser?.userType === 2 || loggedInUser?.userType === 6
              ? 'Complaint List'
              : 'Student Records From Complaints'}
          </h2>


          <div className={buttonStyles['button-group']} style={{marginTop: '0px'}}>
          {loggedInUser?.userType === 1 && (
          <>
            <button
              className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
              onClick={openImportModal}
              >
              <ImportIcon />Import Records
            </button>
            <button
              className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
              onClick={openAddLogBookModal}
            >
              <AddIcon /> Add Log Book
            </button>
            </>
          )}
            <button
                className={`${buttonStyles['action-button']} ${buttonStyles['gold-button']}`}
                onClick={openAddModal}
              >
                <AddIcon /> Add Record
              </button>
          </div>
        </div>

        <div className={styles.filterContainer}>
          <label>
             Filter by:
            {/* Monitored Record Filter */}
            <select onChange={(e) => setMonitoredRecordFilter(e.target.value)} value={monitoredRecordFilter}>
              <option value="All">All Monitored Records</option>
              {monitoredRecordsList.map((record) => (
                <option key={record} value={record}>
                  {record}
                </option>
              ))}
            </select>
            
            <select 
              onChange={(e) => setFilterType(e.target.value)} 
              value={filterType} 
              disabled={loggedInUser?.userType === 2 || loggedInUser?.userType === 5 || loggedInUser?.userType === 6}
              >
              <option value="All">All Sources</option>
              <option value="Log Book">Log Book</option>
              <option value="Complaint">Complaint</option>
              <option value="N/A">N/A</option>
            </select>

            {filterType === 'Complaint' && (
              <select
                onChange={(e) => setCaseStatusFilter(e.target.value)}
                value={caseStatusFilter}
              >
                <option value="All">Select Status</option>
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            )}
          </label>

          <div>
            <div className={styles['search-containerz']}>
                <SearchIcon className={styles['search-icon']} />
                <input
                type="search"
                className={styles['search-input']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name"
                />
            </div>
          </div> 
        </div>

        <div className={styles['table-container']}>
          <table className={styles['record-table']}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Recorded</th>
                <th>Monitored Record</th>
                {/* <th>Status</th> Status column for Case */}
                <th>Remarks/Complaint</th>
                <th>Source</th>
                {/* <th>Sanction</th> */}
                <th>Encoder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.recordId}>
                    <td style={{textAlign: 'left'}}>{record.student.name}</td>
                    <td>{record.record_date ? new Date(record.record_date).toLocaleDateString('en-US') : 'N/A'}</td>
                    <td>{record.monitored_record || 'N/A'}</td>
                    {/* <td
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
                    </td> */}
                    <td>
                      {record.source === 2 ? (
                        <>
                          <strong>Complaint:</strong><br /> {record.complaint} <br /><br />
                          <strong>Investigation Details:</strong><br /> {record.investigationDetails || 'Under Investigation'}
                        </>
                      ) : (
                        <>
                          <strong>Remarks:</strong><br />
                          {record.remarks || 'N/A'} <br />
                        </>
                      )}
                    </td>
                    <td>{record.source === 1 ? 'Logbook' : record.source === 2 ? 'Complaint' : 'N/A'}</td>
                    {/* <td>{record.sanction}</td> */}
                    <td>
                      {record.encoder}
                    </td>
                    <td>
                      <ViewNoteIcon
                        className={buttonStyles['action-icon']}
                        onClick={() => openViewModal(record)}
                        style={{ marginRight: loggedInUser?.userType === 1 ? '15px' : '0' }}
                      />
                      <EditNoteIcon
                        className={buttonStyles['action-icon']}
                        onClick={() => openEditModal(record)}
                        style={{ marginRight: loggedInUser?.userType === 1 ? '15px' : '0' }}
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
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            <ArrowBackIcon />
          </button>
          <span className={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            <ArrowForwardIcon />
          </button>
        </div>
      </div>
      {/* Render the ImportRecordModal here */}
      <ImportRecordModal
        isOpen={showImportModal}
        onClose={closeImportModal}
        refreshRecords={fetchRecords}
        loggedInUser={loggedInUser}
      />

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

      {showAddLogBookModal && (
        <AddLogBookModal isOpen={showAddLogBookModal} onClose={closeAddLogBookModal} refreshRecords={fetchRecords}  />
      )}

    {loading && <div className={styles.loaderOverlay}><Loader /></div>}

    </div>
  );
};
export default Record;
