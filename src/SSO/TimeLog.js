import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TimeLog.module.css'; 
import navStyles from '../Navigation.module.css'; 
import Navigation from '../Navigation'; // Importing the updated Navigation component
import UserTimeLogModal from './UserTimeLogModal'; // Import the modal

const TimeLog = () => {
    const [users, setUsers] = useState([]); // Changed from advisers to users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Changed from selectedAdviser to selectedUser
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const { uid } = loggedInUser;

    // Set the document title for the Time Log page
    useEffect(() => {
        document.title = "SSO | Time Log";
    }, []); // Empty dependency array ensures this runs once when the component mounts

    useEffect(() => {
        const fetchUsers = async () => { // Changed from fetchAdvisers to fetchUsers
            try {
                const response = await axios.get('http://localhost:8080/user/getAllUsers'); // Updated endpoint
                setUsers(response.data); // Set users instead of advisers
            } catch (err) {
                setError('Failed to fetch users'); // Updated error message
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const openModal = () => {
       
        if (selectedUser) { // Changed from selectedAdviser to selectedUser
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setSelectedUser(null); // Changed from selectedAdviser to selectedUser
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    // Filter users based on search query
    const filteredUsers = users.filter(user => { // Changed from filteredAdvisers to filteredUsers
        const fullName = `${user.firstname} ${user.middlename || ''} ${user.lastname}`.toLowerCase();
        const gradeSection = `${user.grade} - ${user.section}`.toLowerCase();
        const email = user.email.toLowerCase();

        const queryLower = searchQuery.toLowerCase();
        return (
            fullName.includes(queryLower) ||
            gradeSection.includes(queryLower) ||
            email.includes(queryLower)
        );
    });

    const handleRowClick = (user, index) => { // Changed from adviser to user
    
        setSelectedUser(user); // Changed from selectedAdviser to selectedUser
        setSelectedRow(index);
    };

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

    if (loading) 
        return <div className='center'>
            <div className="loading">
                <div className="slide"><i></i></div>
                <div className="paper"></div>
                <div className="keyboard"></div>
            </div>
            <p className='period'>Loading...</p>
        </div>
    if (error) return <div>{error}</div>;

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />          

            <div className={navStyles.content}>
                <div className={navStyles.TitleContainer} style={{ justifyContent: 'space-between' }}>
                    <h2 className={navStyles['h1-title']}>Time Log</h2>
                    <div className={styles['logfilter-search-bar']}>
                        <input
                            type="search"
                            className={styles['logsearchRec']}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Name, Grade, Section, or Email..."
                        />
                    </div>  
                </div>
                <div className={styles['time-center-container']}>
                    <div className={styles['time-table-container']}>
                        <table className={styles['time-table']}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>UserType</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? ( // Changed from filteredAdvisers to filteredUsers
                                    filteredUsers.map((user, index) => ( // Changed from adviser to user
                                        <tr 
                                            key={user.user_id} // Changed from adviser_id to user_id
                                            onClick={() => handleRowClick(user, index)} // Changed from adviser to user
                                            className={selectedRow === index ? styles['log-selected-row'] : ''}
                                        >
                                            <td>{`${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`}</td>
                                            <td>{getUserTypeString(user.userType)}</td>
                                            <td>{`${user.email}`}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className={styles['log-no-results']} style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                                            No Results Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>                     
                <div className={styles['log-buttons']}>                  
                    <div className={styles['button-container']}>
                        <button 
                            className={styles.viewlogButton} 
                            onClick={openModal} 
                            disabled={!selectedUser} // Changed from selectedAdviser to selectedUser
                        >
                            View
                        </button>
                    </div>                    
                </div>               
            </div>

            {isModalOpen && (
                <UserTimeLogModal // Changed from AdviserTimeLogModal to UserTimeLogModal
                    user={selectedUser} // Changed from adviser to user
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};

export default TimeLog;
