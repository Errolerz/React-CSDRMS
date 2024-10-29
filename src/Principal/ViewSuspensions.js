import axios from "axios";
import React, { useEffect, useState } from "react";
import navStyles from "../Navigation.module.css"; // Import CSS module for Navigation
import tableStyles from "../GlobalTable.module.css"; // Import GlobalTable CSS module
import Navigation from '../Navigation'; // Import the Navigation component
import SuspensionModal from "./SuspensionModal"; // Import the modal component
import styles from "./ViewSuspensions.module.css"; // Import GlobalTable CSS module
import EditSuspensionModal from "./EditSuspensionModal"; // Import the edit modal component
import ViewReportModal from '../ViewReport';



const ViewSuspensions = () => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSuspension, setSelectedSuspension] = useState(null); // State to store the selected suspension
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control Edit modal visibility
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [showViewReportModal, setShowViewReportModal] = useState(false); // State for showing modal


  useEffect(() => {
    const fetchAndMarkSuspensions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (loggedInUser.userType === 2) {
          await axios.post('http://localhost:8080/suspension/markAsViewedForPrincipal'); // Mark as viewed
        }
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
  


  // Handle row click to select suspension
  const handleRowClick = (suspension) => {
    setSelectedSuspension(suspension);
  };

  // Open the modal and view the selected suspension
  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setShowViewReportModal(true); // Show the modal
  };

  const closeViewReportModal = () => {
    setShowViewReportModal(false); // Close modal
    setSelectedReportId(null);
  };


  const handleDeleteClick = async () => {
    if (selectedSuspension) {
      const confirmDelete = window.confirm("Are you sure you want to delete this suspension?");
      if (!confirmDelete) return; // Exit if user cancels
  
      try {
        await axios.delete(`http://localhost:8080/suspension/delete/${selectedSuspension.suspensionId}`);
        setSuspensions(suspensions.filter(suspension => suspension.suspensionId !== selectedSuspension.suspensionId));
        setSelectedSuspension(null); // Deselect after deletion
      } catch (error) {
        console.error("Error deleting suspension:", error);
        setError("Failed to delete suspension. Please try again later.");
      }
    }
  };
  
  

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />

      <div className={navStyles.content}>
        <div className={navStyles.TitleContainer}>
            <h2 className={navStyles['h1-title']}>Suspension List</h2>
        </div>  
        {loading && <p>Loading suspensions...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <>
            <div className={tableStyles['table-container']}>
              <table className={tableStyles['global-table']}>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Student</th>
                    <th>Adviser</th>
                    <th>Date Submitted</th>
                    <th>Suspended</th>
                    {/* <th>Start Date</th>
                    <th>End Date</th>
                    <th>Return Date</th>
                    <th>Complaint</th> */}
                  </tr>
                </thead>
                <tbody>
                  {suspensions.length > 0 ? (
                    suspensions.map((suspension) => (
                      <tr 
                        key={suspension.suspensionId} 
                        onClick={() => handleRowClick(suspension)}
                        className={selectedSuspension?.suspensionId === suspension.suspensionId ? tableStyles['selected-row'] : ''}
                      >
                        <td>{suspension.reportEntity.reportId}</td>  
                        <td>{suspension.reportEntity.record.student.name}</td>
                        <td>{suspension.reportEntity.adviser.firstname} {suspension.reportEntity.adviser.lastname}</td>                      
                        <td>{suspension.dateSubmitted}</td>
                        <td>{suspension.days} Days</td>
                        {/* <td>{suspension.startDate}</td>
                        <td>{suspension.endDate}</td>
                        <td>{suspension.returnDate}</td>
                        <td>{suspension.reportEntity.complaint}</td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No suspensions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
             
            </div>

            {/* "View" button below the table */}
            <div className={styles["suspension-action-buttons"]}>
            <button 
              variant="contained" 
              onClick={() => {
                if (loggedInUser.userType === 1) {
                  handleViewReport(selectedSuspension.reportId); // Call function for userType 1
                } else {
                  handleViewClick(); // Call existing view function for other userTypes
                }
              }} 
              className={styles['suspension-button']} 
              disabled={!selectedSuspension} // Disable when no row is selected
            >
              View
            </button>

            {loggedInUser.userType === 1 && (
                <>
                  <button
                    variant="contained"
                    onClick={handleEditClick}
                    className={styles['suspension-button']}
                    disabled={!selectedSuspension} // Disable if no row selected
                  >
                    Edit
                  </button>
                  <button
                    variant="contained"
                    onClick={handleDeleteClick}
                    className={styles['suspension-button']}
                    disabled={!selectedSuspension} // Disable if no row selected
                  >
                    Delete
                  </button>
                </>
              )}
           
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
          />
        )}

          {showViewReportModal && (
          <ViewReportModal
            reportId={selectedSuspension.reportId}
            onClose={closeViewReportModal}
          />
        )} 
        
      </div>
    </div>
  );
};

export default ViewSuspensions;
