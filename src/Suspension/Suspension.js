import axios from "axios";
import React, { useEffect, useState } from "react";

import navStyles from "../Navigation.module.css"; // Import CSS module for Navigation
import tableStyles from "../GlobalTable.module.css"; // Import GlobalTable CSS module
import formStyles from "../GlobalForm.module.css";
import styles from "./Suspension.module.css"; // Import GlobalTable CSS module

import Navigation from '../Navigation'; // Import the Navigation component
import SuspensionModal from "./SuspensionModal"; // Import the modal component
import EditSuspensionModal from "./EditSuspensionModal"; // Import the edit modal component

import CheckIcon from '@mui/icons-material/CheckBox';
import CheckOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import EditNoteIcon from '@mui/icons-material/Edit';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import SearchIcon from '@mui/icons-material/Search';

const ViewSuspensions = () => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSuspension, setSelectedSuspension] = useState(null); // State to store the selected suspension
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control Edit modal visibility

  const [filterApproved, setFilterApproved] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    if (!loggedInUser) return;
    
    console.log('loggedInUser.userType:', loggedInUser?.userType); // Debug log

    const userTypeTitles = {
      1: 'SSO',
      2: 'Principal',
    };
  
    const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
    document.title = `${userTypeTitle} | Suspension List`;
  }, [loggedInUser]);

  useEffect(() => {
    const fetchAndMarkSuspensions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8080/suspension/getAllSuspensions');
  
        const sortedSuspensions = response.data.sort((a, b) => b.suspensionId - a.suspensionId);
        setSuspensions(sortedSuspensions);
      } catch (error) {
        console.error('Error fetching suspensions:', error);
        setError('Failed to fetch suspensions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAndMarkSuspensions();
  }, []);

  // Open the modal to view the selected suspension
  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleApproveClick = async () => {
    if (selectedSuspension) {
      try {
        const response = await axios.post(
          `http://localhost:8080/suspension/approveSuspension/${loggedInUser.userId}?suspensionId=${selectedSuspension.suspensionId}`
        );
        console.log("Approval Response:", response.data);
        alert("Suspension approved successfully.");
        
        // Update state to reflect the approval
        setSuspensions((prev) =>
          prev.map((suspension) =>
            suspension.suspensionId === selectedSuspension.suspensionId
              ? { ...suspension, approved: true }
              : suspension
          )
        );
      } catch (error) {
        console.error("Error approving suspension:", error);
        setError("Failed to approve suspension. Please try again later.");
      }
    }
  };
  

  const handleDeleteClick = async () => {
    if (selectedSuspension) {
      const confirmDelete = window.confirm("Are you sure you want to delete this suspension?");
      if (!confirmDelete) return; // Exit if user cancels
  
      try {
        await axios.delete(`http://localhost:8080/suspension/delete/${selectedSuspension.suspensionId}/${loggedInUser.userId}`);
        setSuspensions(suspensions.filter(suspension => suspension.suspensionId !== selectedSuspension.suspensionId));
        setSelectedSuspension(null); // Deselect after deletion
      } catch (error) {
        console.error("Error deleting suspension:", error);
        setError("Failed to delete suspension. Please try again later.");
      }
    }
  };

  const filteredSuspensions = suspensions.filter((suspension) => {
    const matchesSearchQuery = suspension.record.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suspension.record.student.sid.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterApproved === "approved") return suspension.approved === true && matchesSearchQuery;
    if (filterApproved === "unapproved") return suspension.approved === false && matchesSearchQuery;
    return matchesSearchQuery;
  });

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />

      <div className={navStyles.content}>
        
        <div className={navStyles.TitleContainer}>
            <h2 className={navStyles['h1-title']}>Suspension List</h2>
        </div>  

        <div className={styles['separator']}>
          <div className={styles['search-container']}>
            <SearchIcon className={styles['search-icon']} />
            <input
              id="searchQuery"
              type="text"
              className={styles["search-input"]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID"
            />
          </div>   
        </div>
     
        
        {loading && <p>Loading suspensions...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <>
            <div className={styles['suspension-filter']}>
              <label htmlFor="filterApproved">Filter by Approval Status:
                <select
                  id="filterApproved"
                  value={filterApproved}
                  onChange={(e) => setFilterApproved(e.target.value)}
                  className={styles["filter-select"]}
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="unapproved">Unapproved</option>
                </select>
              </label>
            </div>

            <div className={tableStyles['table-container']}>
              <table className={tableStyles['global-table']}>
                <thead>
                  <tr>
                    <th style={{ width: '350px' }}>Student</th>
                    <th>Grade & Section</th>
                    <th>Date Submitted</th>
                    <th>Days Of Suspension</th>
                    <th>Suspension</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuspensions.length > 0 ? (
                    filteredSuspensions.map((suspension) => (
                      <tr>
                        <td style={{ width: '350px' }}>{suspension.record.student.name}</td>  
                        <td>{suspension.record.student.grade} - {suspension.record.student.section}</td>             
                        <td>{suspension.dateSubmitted}</td>
                        <td>{suspension.days} Days</td>
                        <td style={{ fontWeight: 'bold', color: suspension.approved ? '#4caf50' : '#e53935' }}>
                          {suspension.approved ? 'Approved' : 'Not Approved'}
                        </td>
                        <td> 
                          {loggedInUser.userType === 2 && (
                            <>
                              <ViewNoteIcon
                                variant="contained" 
                                className={formStyles['action-icon']}
                                style={{ marginRight: '15px' }}
                                onClick={() => {
                                  setSelectedSuspension(suspension); // Set the selected suspension
                                  handleViewClick(); // Open the modal 
                                }}
                              />
                              
                              {suspension.approved ? (
                                <CheckIcon
                                  variant="contained"
                                  className={formStyles['action-icon']}
                                  disabled={true}
                                />
                              ) : (
                                <CheckOutlinedIcon
                                  variant="contained"
                                  onClick={() => {
                                    setSelectedSuspension(suspension); // Set the suspension to be approved
                                    const confirmApproval = window.confirm("Are you sure you want to approve this suspension?");
                                    if (confirmApproval) {
                                      handleApproveClick(); 
                                    }
                                  }}
                                  className={formStyles['action-icon']}
                                />
                              )}
                            </>
                          )}

                          {loggedInUser.userType === 1 && (
                            <>
                              <ViewNoteIcon
                                variant="contained"
                                className={formStyles['action-icon']}
                                style={{ marginRight: '15px' }}
                                onClick={() => {
                                  setSelectedSuspension(suspension); // Set the selected suspension
                                  handleViewClick(); // Open the view modal
                                }}
                              />
                              <EditNoteIcon
                                variant="contained"
                                className={formStyles['action-icon']}
                                style={{ marginRight: '15px' }}
                                onClick={() => {
                                  setSelectedSuspension(suspension); // Set the selected suspension
                                  handleEditClick(); // Open the edit modal
                                }}
                              />

                              <DeleteIcon
                                variant="contained"
                                className={formStyles['action-icon']}
                                onClick={() => {
                                  setSelectedSuspension(suspension); // Set the selected suspension
                                  handleDeleteClick(); // Confirm and delete
                                }}
                              />
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No suspensions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Suspension Modal */}
        {selectedSuspension && (
          <SuspensionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            suspension={selectedSuspension}
          />
        )}

        {/* Edit Suspension Modal */}
        {selectedSuspension && (
          <EditSuspensionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            suspension={selectedSuspension}
            setSuspensions={setSuspensions}
          />
        )}
      </div>
    </div>
  );
};

export default ViewSuspensions;
