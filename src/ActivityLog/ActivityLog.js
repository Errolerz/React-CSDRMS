import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Navigation from '../Components/Navigation';
import navStyles from '../Components/Navigation.module.css'; 
import formStyles from '../GlobalForm.module.css';
import tableStyles from '../GlobalTable.module.css';
import styles from './ActivityLog.module.css';

import UserTimeLogModal from './UserTimeLogModal';
import Loader from '../Loader';

import SearchIcon from '@mui/icons-material/Search';
import ViewNoteIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ActivityLog = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserType, setSelectedUserType] = useState(''); // State for user type filter
    const [selectedUser, setSelectedUser] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Number of items per page

    useEffect(() => {
        if (!loggedInUser) return;

        const userTypeTitles = {
            1: 'SSO',
            4: 'Admin',
        };

        const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
        document.title = `${userTypeTitle} | Activity Log`;
    }, []);

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/activity-log/getAllActivityLogs');
                const sortedLogs = response.data.sort((a, b) => b.activitylog_id - a.activitylog_id); // Sort by ID in descending order
                setActivityLogs(sortedLogs);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching activity logs.');
            } finally {
                setLoading(false);  // Set loading to false after fetching data
            }
        };

        fetchActivityLogs();
    }, []);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleUserTypeChange = (e) => setSelectedUserType(e.target.value); // Update user type filter

    const handleViewClick = (user) => setSelectedUser(user);
    const closeModal = () => setSelectedUser(null);

    const getUserTypeString = (userType) => {
        switch (userType) {
            case 1: return 'SSO';
            case 2: return 'Principal';
            case 3: return 'Adviser';
            case 4: return 'Admin';
            case 5: return 'Teacher';
            case 6: return 'Guidance';
            default: return 'Unknown';
        }
    };

    // Filter activity logs
    const filteredLogs = activityLogs.filter((log) => {
        const fullName = `${log.user.firstname} ${log.user.lastname}`.toLowerCase();
        const userTypeString = getUserTypeString(log.user.userType).toLowerCase();
        const searchLower = searchQuery.toLowerCase();

        return (
            (fullName.includes(searchLower) || userTypeString.includes(searchLower)) &&
            (selectedUserType === '' || log.user.userType.toString() === selectedUserType)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
            <div className={navStyles.content}>
                <div className={navStyles.TitleContainer}>
                    <h2 className={navStyles['h1-title']}>Activity Log</h2>
                </div>

                <div className={styles['filters']}>
                    <label htmlFor="userType">
                        Filter by User Type: 
                        <select
                            id="userType"
                            value={selectedUserType}
                            onChange={handleUserTypeChange}
                        >
                            <option value="">All</option>
                            <option value="1">SSO</option>
                            <option value="2">Principal</option>
                            <option value="3">Adviser</option>
                            <option value="4">Admin</option>
                            <option value="5">Teacher</option>
                            <option value="6">Guidance</option>
                        </select>
                    </label>

                    <div>
                        <div className={styles['search-container']}>
                            <SearchIcon className={styles['search-icon']} />
                            <input
                                type="search"
                                className={styles['search-input']}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by Name"
                            />
                        </div>
                    </div>
                </div>

                <div className={tableStyles['table-container']}>
                    <table className={tableStyles['global-table']}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>UserType</th>
                                <th>Action</th>
                                <th>Description</th>
                                <th>Timestamp</th>
                                <th className={styles['icon-cell']} style={{borderRight: '0.5px solid #8A252C'}}>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.activitylog_id}>
                                        <td style={{textAlign: 'left', paddingLeft: '50px'}}>{log.user.firstname} {log.user.lastname}</td>
                                        <td>{getUserTypeString(log.user.userType)}</td>
                                        <td>{log.action}</td>
                                        <td>{log.description}</td>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className={styles['icon-cell']}>
                                            <ViewNoteIcon
                                                className={formStyles['action-icon']}
                                                onClick={() => handleViewClick(log.user)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={styles['no-results']}>No activity log found...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
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

            {selectedUser && <UserTimeLogModal user={selectedUser} onClose={closeModal} />}

            {/* Loader Overlay */}
            {loading && <Loader />}
        </div>
    );
};

export default ActivityLog;
