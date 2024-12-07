import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Navigation from '../Navigation';
import navStyles from '../Navigation.module.css'; 
import formStyles from '../GlobalForm.module.css';
import tableStyles from '../GlobalTable.module.css';
import styles from './ActivityLog.module.css';

import UserTimeLogModal from './UserTimeLogModal';

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
    const [selectedUser, setSelectedUser] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Number of items per page

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const response = await axios.get('https://spring-csdrms-g8ra.onrender.com/activity-log/getAllActivityLogs');
                const sortedLogs = response.data.sort((a, b) => b.activitylog_id - a.activitylog_id); // Sort by ID in descending order
                setActivityLogs(sortedLogs);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching activity logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLogs();
    }, []);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

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

        return fullName.includes(searchLower) || userTypeString.includes(searchLower);
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

    if (loading) {
        return <div>Loading activity logs...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />
            <div className={navStyles.content}>
                <div className={navStyles.TitleContainer}>
                    <h2 className={navStyles['h1-title']}>Activity Log</h2>
                </div>

                <div className={styles['separator']}>
                    <div className={styles['search-container']}>
                        <SearchIcon className={styles['search-icon']} />
                        <input
                            type="search"
                            className={styles['search-input']}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by Name or UserType"
                        />
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
                                <th className={styles['icon-cell']}>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.activitylog_id}>
                                        <td>{log.user.firstname} {log.user.lastname}</td>
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
        </div>
    );
};

export default ActivityLog;
