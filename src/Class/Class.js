import React, { useEffect, useState } from "react";

import axios from "axios";
import styles from './Class.module.css';
import navStyles from '../Components/Navigation.module.css';
import buttonStyles from '../GlobalButton.module.css';
import Navigation from '../Components/Navigation';
import Loader from '../Loader';

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import AddIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

const Class = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = authToken ? JSON.parse(authToken) : null;

    const [classes, setClasses] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [newGrade, setNewGrade] = useState(null);
    const [newSection, setNewSection] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGradeFilter, setSelectedGradeFilter] = useState("");
    const [selectedSectionFilter, setSelectedSectionFilter] = useState("");
      const [isLoading, setIsLoading] = useState(true); // Loading state

    const [modalType, setModalType] = useState("Class"); // Class or School Year
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        document.title = "Admin | Class";
        const fetchData = async () => {
            await Promise.all([fetchClasses(), fetchSchoolYears()]);
        };
        fetchData();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get("http://localhost:8080/class/getAllClasses");
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
            alert("Failed to fetch classes");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };
    const fetchSchoolYears = async () => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get("http://localhost:8080/schoolYear/getAllSchoolYears");
            setSchoolYears(response.data);
        } catch (error) {
            console.error("Error fetching school years:", error);
            alert("Failed to fetch school years");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const handleStartYearChange = (e) => {
        const value = Number(e.target.value);
        if (value > 0) {
            setStartYear(value);
        }
    };
    
    const handleEndYearChange = (e) => {
        const value = Number(e.target.value);
        if (value > 0) {
            setEndYear(value);
        }
    };
    

    const handleOpenModal = () => {
        const currentYear = new Date().getFullYear();
        setStartYear(currentYear);
        setEndYear(currentYear + 1);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewGrade(null);
        setNewSection("");
        setStartYear("");
        setEndYear("");
    };

    const addClass = async () => {
        if (!newGrade || !newSection) {
            alert("Please fill in all fields");
            return;
        }

        const classExists = classes.some(
            classItem =>
                classItem.grade === newGrade &&
                classItem.section.toLowerCase() === newSection.toLowerCase()
        );

        if (classExists) {
            alert("Class already exists");
            return;
        }

        try {
            await axios.post("http://localhost:8080/class/addClass", {
                grade: newGrade,
                section: newSection,
            });
            await fetchClasses();
            handleCloseModal();
        } catch (error) {
            console.error("Error adding class:", error);
            alert("Failed to add class");
        }
    };

    const addSchoolYear = async () => {
        if (!startYear || !endYear) {
            alert("Please fill in all fields");
            return;
        }

        const newSchoolYear = `${startYear}-${endYear}`;

        const schoolYearExists = schoolYears.some(schoolYear => schoolYear.schoolYear === newSchoolYear);
        if (schoolYearExists) {
            alert("School year already exists");
            return;
        }

        try {
            await axios.post("http://localhost:8080/schoolYear/addSchoolYear", {
                schoolYear: newSchoolYear,
            });
            await fetchSchoolYears();
            handleCloseModal();
        } catch (error) {
            console.error("Error adding school year:", error);
            alert("Failed to add school year");
        }
    };

    const handleSubmit = () => {
        if (modalType === "Class") {
            addClass();
        } else if (modalType === "School Year") {
            addSchoolYear();
        }
    };

    const deleteClass = async (classId) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;
    
        try {
            await axios.delete(`http://localhost:8080/class/deleteClass/${classId}`);
            setClasses(classes.filter((classItem) => classItem.class_id !== classId));
            alert("Class deleted successfully!");
        } catch (error) {
            console.error("Error deleting class:", error);
            alert("Failed to delete class");
        }
    };
    
    const deleteSchoolYear = async (schoolYearId) => {
        if (!window.confirm("Are you sure you want to delete this school year?")) return;
    
        try {
            await axios.delete(`http://localhost:8080/schoolYear/deleteSchoolYear/${schoolYearId}`);
            setSchoolYears(schoolYears.filter((schoolYear) => schoolYear.schoolYear_ID !== schoolYearId));
            alert("School year deleted successfully!");
        } catch (error) {
            console.error("Error deleting school year:", error);
            alert("Failed to delete school year");
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleGradeFilter = (e) => setSelectedGradeFilter(e.target.value);
    const handleSectionFilter = (e) => setSelectedSectionFilter(e.target.value);

    const filteredClasses = classes
    .filter(classItem => 
        (classItem.grade.toString().includes(searchTerm) || 
        classItem.section?.toLowerCase().includes(searchTerm) ||
        (classItem.schoolYear && classItem.schoolYear.toLowerCase().includes(searchTerm))) &&
        (selectedGradeFilter ? classItem.grade === Number(selectedGradeFilter) : true) &&
        (selectedSectionFilter ? classItem.section?.toLowerCase().includes(selectedSectionFilter.toLowerCase()) : true)
    )
    .sort((a, b) => a.grade - b.grade);

    const filteredSchoolYears = schoolYears.filter(schoolYear =>
        schoolYear.schoolYear?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />

            <div className={navStyles.content}>
                <div className={navStyles.TitleContainer}>
                    <h2 className={navStyles['h1-title']}>Class Management</h2>

                    <div className={buttonStyles['button-group']} style={{ marginTop: '0' }}>
                        <button 
                            onClick={handleOpenModal} 
                            className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
                        >
                            <AddIcon />Add Class || School Year
                        </button>
                    </div>
                </div>

                <div className={styles['filter-container']}>
                    <label>
                        Filter by Grade:
                        <select
                            value={selectedGradeFilter}
                            onChange={handleGradeFilter}
                        >
                            <option value="">Select Grade</option>
                            <option value={7}>Grade 7</option>
                            <option value={8}>Grade 8</option>
                            <option value={9}>Grade 9</option>
                            <option value={10}>Grade 10</option>
                        </select>
                    </label>

                    <div>
                        <div className={styles['search-container']}>
                            <SearchIcon className={styles['search-icon']} />
                            <input
                                type="search"
                                placeholder="Search by Section or S.Y."
                                value={searchTerm}
                                onChange={handleSearch}
                                className={styles['search-input']}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.divide}>
                    {/* Class Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.tableInner}>
                            <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Section</th>
                                    <th style={{ borderRight: '0.5px solid #8A252C' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.length > 0 ? (
                                    filteredClasses.map(classItem => (
                                        <tr key={classItem.class_id}>
                                            <td>{classItem.grade}</td>
                                            <td>{classItem.section}</td>
                                            <td>
                                                <DeleteIcon 
                                                    onClick={() => deleteClass(classItem.class_id)} 
                                                    className={styles['action-icon']}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No Results Found...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* School Year Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.tableInner}>
                            <thead>
                                <tr>
                                    <th>School Year</th>
                                    <th style={{ borderRight: '0.5px solid #8A252C' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchoolYears.length > 0 ? (
                                    filteredSchoolYears.map(schoolYear => (
                                        <tr key={schoolYear.schoolYear_ID}>
                                            <td>{schoolYear.schoolYear}</td>
                                            <td>
                                                <DeleteIcon 
                                                    onClick={() => deleteSchoolYear(schoolYear.schoolYear_ID)} 
                                                    className={styles['action-icon']}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">No Results Found...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unified Modal */}
                <Modal open={showModal} onClose={handleCloseModal}>
                    <Box className={styles.modalContainer}>
                        <h2 className={styles.modalHeader}>Add {modalType}</h2>
                        <div className={styles['class-container']}>
                            <div className={styles['class-group']}>
                                <label className={styles['classgroup-label']}>Select Type: </label>
                                <select
                                    className={styles['classgroup-input']}
                                    value={modalType}
                                    onChange={(e) => setModalType(e.target.value)}
                                >
                                    <option value="Class">Class</option>
                                    <option value="School Year">School Year</option>
                                </select>
                            </div>

                            {modalType === "Class" && (
                                <>
                                    <div className={styles['class-group']}>
                                        <label className={styles['classgroup-label']}>Grade: </label>
                                        <select
                                            className={styles['classgroup-input']}
                                            value={newGrade}
                                            onChange={(e) => setNewGrade(Number(e.target.value))}
                                        >
                                            <option value="">Select Grade</option>
                                            <option value={7}>Grade 7</option>
                                            <option value={8}>Grade 8</option>
                                            <option value={9}>Grade 9</option>
                                            <option value={10}>Grade 10</option>
                                        </select>
                                    </div>
                                    <div className={styles['class-group']}>
                                        <label className={styles['classgroup-label']}>Section: </label>
                                        <input
                                            className={styles['classgroup-input']}
                                            type="text"
                                            placeholder="Enter Section"
                                            value={newSection}
                                            onChange={(e) => setNewSection(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {modalType === "School Year" && (
                                <div className={styles['year-container']}>
                                    <div className={styles['class-group']}>
                                        <label className={styles['classgroup-label']}>Start Year: </label>
                                        <input
                                            className={styles['classgroup-input']}
                                            type="number"
                                            placeholder="Enter start year"
                                            value={startYear}
                                            onChange={handleStartYearChange}
                                        />
                                    </div>
                                    <div className={styles['class-group']}>
                                        <label className={styles['classgroup-label']}>End Year: </label>
                                        <input
                                            className={styles['classgroup-input']}
                                            type="number"
                                            placeholder="Enter end year"
                                            value={endYear}
                                            onChange={handleEndYearChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={buttonStyles['button-group']}>
                            <button onClick={handleSubmit} className={`${buttonStyles['action-button']} ${buttonStyles['green-button']}`}>Add </button>
                            <button onClick={handleCloseModal} className={`${buttonStyles['action-button']} ${buttonStyles['red-button']}`}>Cancel</button>
                        </div>
                    </Box>
                </Modal>
            </div>
            {isLoading && <Loader />}
        </div>
    );
};

export default Class;
