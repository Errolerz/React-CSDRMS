import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./EditSuspensionModal.module.css"; // Import CSS module for styling

const EditSuspensionModal = ({ isOpen, onClose, suspension }) => {
  // States to hold edited suspension data
  const [startDate, setStartDate] = useState(suspension.startDate);
  const [endDate, setEndDate] = useState(suspension.endDate);
  const [returnDate, setReturnDate] = useState(suspension.returnDate);
  const [days, setDays] = useState(suspension.days);
  const [offense, setOffense] = useState(suspension.offense);
  const [error, setError] = useState(null);


  useEffect(() => {
    setStartDate(suspension.startDate);
    setEndDate(suspension.endDate);
    setReturnDate(suspension.returnDate);
    setDays(suspension.days);
    setOffense(suspension.offense);
  }, [suspension]);
 

  // Function to handle saving edited suspension data
  const handleSave = async () => {
    try {
      const updatedSuspension = {
        ...suspension,
        startDate,
        endDate,
        returnDate,
        days,
        offense,
      };

      await axios.put(`http://localhost:8080/suspension/update/${suspension.suspensionId}`, updatedSuspension);
      window.location.reload();
      onClose(); // Close modal after save
    } catch (error) {
      console.error("Error updating suspension:", error);
      setError("Failed to update suspension. Please try again later.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-container"]}>
        <h2>Edit Suspension</h2>
        {error && <p className={styles["error-message"]}>{error}</p>}


        <label>
          Days:
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>

        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label>
          Return Date:
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </label>

       
        <label>
          Offense:
          <textarea
            value={offense}
            onChange={(e) => setOffense(e.target.value)}
          />
        </label>

        <div className={styles["modal-actions"]}>
          <button onClick={handleSave} className={styles["save-button"]}>
            Save
          </button>
          <button onClick={onClose} className={styles["cancel-button"]}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSuspensionModal;
