import React, { useEffect,useRef, useState } from 'react';
import axios from 'axios';

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ExportIcon from '@mui/icons-material/FileUpload';

import styles from "./SuspensionModal.module.css"; // Import custom styles for this modal
import buttonStyles from "../GlobalButton.module.css";

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const SuspensionModal = ({ isOpen, onClose, suspension }) => {
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = JSON.parse(authToken);
  const [principal, setPrincipal] = useState(null); // State to store principal's data

  const exportRef = useRef(); 
  
  useEffect(() => {
    const fetchPrincipal = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/getPrincipal', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setPrincipal(response.data);
      } catch (error) {
        console.error("Error fetching principal data:", error);
      }
    };

    const markAsViewedForPrincipal = async () => {
      try {
        await axios.post(`http://localhost:8080/suspension/markAsViewedForPrincipal/${suspension.suspensionId}/${loggedInUser.userId}`, null, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (error) {
        console.error("Error marking suspension as viewed for principal:", error);
      }
    };
  
    if (isOpen) {
      fetchPrincipal(); // Fetch principal data only when modal is open
      if (loggedInUser.userType === 2 && suspension.viewedByPrincipal === false) {
        markAsViewedForPrincipal();
      }
    }
  }, [
    isOpen, 
    authToken, 
    loggedInUser.userId, 
    loggedInUser.userType, 
    suspension.suspensionId, 
    suspension.viewedByPrincipal
  ]); // Add the missing dependencies
  

  const handleExportToPDF = async () => {
    const element = exportRef.current;

    // Capture the element as an image using html2canvas
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    // Create jsPDF document with long bond paper size
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [216, 330], // Long bond paper size in mm
    });

    // Define margins and calculate content dimensions
    const marginTop = 20; // Top margin in mm
    const marginLeft = 10; // Left margin in mm
    const pdfWidth = 216 - 2 * marginLeft; // Width adjusted for margins
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio

    // Add title and custom header (optional)
    pdf.setFontSize(16);
    // pdf.text('Student Suspension', marginLeft, marginTop - 10);

    // Add the image content with margins
    pdf.addImage(imgData, 'PNG', marginLeft, marginTop, pdfWidth, pdfHeight);

    // Optional footer
    pdf.setFontSize(10);
    pdf.text('Generated on: ' + new Date().toLocaleDateString(), marginLeft, 330 - 10); // Bottom left corner

    // Save the PDF
    pdf.save('suspension-form.pdf');
};

  return (
    <Modal open={isOpen} onClose={onClose}>
      
      <Box className={styles["suspension-modal-modalContainer"]}>
      <button
        className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
        style={{
          display: 'flex', // Make the button a flex container
          justifyContent: 'flex-start', // Align content to the left
          alignItems: 'center', // Vertically center the content
        }}
        onClick={handleExportToPDF}
      >
        <ExportIcon style={{ marginRight: '8px' }} /> Export to PDF
      </button>
      <div ref={exportRef} className={styles.exportSection}>
        <div className={styles["suspension-modal-formContainer"]}>
        
          <h2 className={styles["suspension-modal-title"]}>Suspension Form</h2>

          {/* Date Field */}
          <p><strong>Date: </strong> {new Date().toLocaleDateString()}</p>

          {/* Principal's Address */}
          <p><strong>To:</strong> {principal ? `${principal.firstname} ${principal.lastname}` : "Loading..."}<br />
          Principal<br />
          Cebu Institute of Technology - University<br />
          Cebu City</p>

          {/* Body */}
          <p>Dear Ma'am,</p>

          <p>
            I would like to submit the recommendation for the suspension of 
            <strong> {suspension.record.student.name} </strong> 
            of <strong>{suspension.record.student.grade} - {suspension.record.student.section}</strong> for 
            <strong> {suspension.days}</strong> days, starting 
            <strong> {suspension.startDate}</strong> until 
            <strong> {suspension.endDate}</strong>.
          </p>

          <p>
            This disciplinary action is given to him/her for infractions/violations of school and department policies, rules, and regulations as proven after investigation. He/She will be made to report back to his/her classes on 
            <strong> {suspension.returnDate}</strong>.
          </p>

          {/* Offense */}
          <p><strong>OFFENSE(S) COMMITTED:</strong></p>
          <p> <strong>{suspension.record.investigationDetails}</strong></p>

          {/* Closing */}
          <p>
            I am looking forward to your approval for this matter.<br />
            Thank you very much.
          </p>

          {/* Sincerely */}
          <p>
            Sincerely yours,<br />
            HS-SSO
          </p>

        </div>
        </div>
      </Box>
    
    </Modal>
  );
};

export default SuspensionModal;
