import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ActivityLog.module.css'; // Import your CSS module here
import navStyles from './Navigation.module.css'; 
import Navigation from './Navigation';
import tableStyles from './GlobalTable.module.css';
import UserTimeLogModal from './SSO/UserTimeLogModal'

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

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/getAllUsers');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };
    
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    
    const filteredUsers = users.filter(user =>
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Open UserTimeLogModal for a selected user
    const handleUserClick = (user) => setSelectedUser(user);

    // Close UserTimeLogModal
    const closeModal = () => setSelectedUser(null);

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
                <div className={styles['search-container']}>
                        <input
                            type="text"
                            className={styles['search-input']} // Apply CSS class
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                </div>  
            </div>

            {/* Users List */}
            <div>
                {searchQuery && ( // Only render the user list if there's a search query
                <>
                {/* <h3>Users</h3> */}
                    <ul className={styles['users-list']}>
                        {filteredUsers.length > 0 ? ( // Check if there are filtered users
                            filteredUsers.map(user => (
                                <li 
                                    key={user.userId} 
                                    className={styles['user-item']} 
                                    onClick={() => handleUserClick(user)}
                                >
                                    {user.firstname} {user.lastname}
                                </li>
                            ))
                        ) : (
                            <li>No users found.</li> // Message when no users match the search
                        )}
                    </ul>
                    </>
                )}
            </div>
            <div className={tableStyles['table-container']}>
            <table className={tableStyles['global-table']}>
                <thead>
                    <tr>
                        
                        <th>Action</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                     
                    </tr>
                </thead>
                <tbody>
                    {activityLogs.map(log => (
                        <tr key={log.activitylog_id}>
                            
                            <td>{log.action}</td>
                            <td>{log.description}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                           
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
        {selectedUser && <UserTimeLogModal user={selectedUser} onClose={closeModal} />}
    </div>
    );
};

export default ActivityLog;
