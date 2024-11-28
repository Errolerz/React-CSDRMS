import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Navigation from '../Navigation';
import navStyles from '../Navigation.module.css'; 
import formStyles from '../GlobalForm.module.css';
import tableStyles from '../GlobalTable.module.css';
import styles from './ActivityLog.module.css'; // Import your CSS module here

import UserTimeLogModal from './UserTimeLogModal';

import SearchIcon from '@mui/icons-material/Search';
import ViewNoteIcon from '@mui/icons-material/Visibility';

const ActivityLog = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (loggedInUser.userType === 1) {
            document.title = 'SSO | Activity Log';
        } else if (loggedInUser.userType === 4) {
            document.title = 'Admin | Activity Log';
        } else {
            document.title = 'Activity Log';
        }
    }, [loggedInUser]);
    

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/activity-log/getAllActivityLogs');
                const sortedLogs = response.data.sort((a, b) => b.activitylog_id - a.activitylog_id); // Sort by ID in descending order
                setActivityLogs(sortedLogs);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching activity logs.');
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/user/getAllUsers');
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchActivityLogs();
        fetchUsers();
    }, []);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    // Open UserTimeLogModal for a selected user
    const handleViewClick = (user) => setSelectedUser(user);

    // Close UserTimeLogModal
    const closeModal = () => setSelectedUser(null);

    if (loading) {
        return <div>Loading activity logs...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

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

    // Filter the activity logs based on the search query and user type
    const filteredLogs = activityLogs.filter((log) => {
        const isAdviser = log.user.userType === 3; // Check if the user is an adviser
        const fullName = `${log.user.firstname} ${log.user.lastname}`.toLowerCase();
        const userTypeString = getUserTypeString(log.user.userType).toLowerCase();
        const searchLower = searchQuery.toLowerCase();

        // If logged in user is SSO (user type 1), only include advisers
        const isSSOUser = loggedInUser.userType === 1;

        return (isSSOUser ? isAdviser : true) && (fullName.includes(searchLower) || userTypeString.includes(searchLower));
    });

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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Name or UserType"
                        />
                    </div>
                </div>
                
                <div className={tableStyles['table-container']}>
                    <table className={tableStyles['global-table']}>
                        <thead>
                            <tr>
                                <th style={{ width: '200px' }}>Name</th>
                                <th style={{ width: '150px' }}>UserType</th>
                                <th>Action</th>
                                <th>Description</th>
                                <th>Timestamp</th>
                                <th className={styles['icon-cell']}>View</th> {/* Add a View column */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
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
            </div>
            {selectedUser && <UserTimeLogModal user={selectedUser} onClose={closeModal} />}
        </div>
    );
};

export default ActivityLog;
