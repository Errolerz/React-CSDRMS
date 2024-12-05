import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import styles from './UserManagement.module.css';
import navStyles from '../Navigation.module.css';
import buttonStyles from '../GlobalButton.module.css';

import Navigation from '../Navigation'; // Importing the updated Navigation component
import AddUserModal from './AddUserModal';  
import ConfirmationModal from './ConfirmationModal';  
import UpdateAccountModal from './UpdateAccountModal'; 

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/PersonAdd';
import EditNoteIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon

const AdminDashboard = () => {
  // State variables
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const loggedInUser = authToken ? JSON.parse(authToken) : null;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isUpdateAccountModalOpen, setIsUpdateAccountModalOpen] = useState(false);
  
  useEffect(() => {
    if (!authToken || !loggedInUser) {
      navigate('/login');
      return;
    }
  
    document.title = "Admin | User Management";
    fetchUsers();
  }, []); // Add missing dependencies
  

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Close the respective modals when the 'Esc' key is pressed
        if (isAddUserModalOpen) setIsAddUserModalOpen(false);
        if (isConfirmationModalOpen) setIsConfirmationModalOpen(false);
        if (isUpdateAccountModalOpen) setIsUpdateAccountModalOpen(false);
      }
    };
  
    // Attach the event listener when any modal is open
    if (isAddUserModalOpen || isConfirmationModalOpen || isUpdateAccountModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
  
    // Clean up the event listener when the modals are closed or component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddUserModalOpen, isConfirmationModalOpen, isUpdateAccountModalOpen]);
  

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/user/getAllUsers');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setConfirmationMessage(`Are you sure you want to delete the user "${selectedUser.username}"?`);
      setIsConfirmationModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await axios.delete(`http://localhost:8080/user/deleteUser/${selectedUser.username}/${loggedInUser.userId}`);
        setUsers(prevUsers => prevUsers.filter(user => user.username !== selectedUser.username));
        setSelectedUser(null);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      setIsUpdateAccountModalOpen(true);
    }
  };

  const handleAddUser = () => setIsAddUserModalOpen(true);

  const refreshUsers = () => fetchUsers();

  const filteredUsers = useMemo(() => users.filter(user => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const usernameMatches = user.username.toLowerCase().includes(lowerCaseQuery);
    const nameMatches = `${user.firstname} ${user.lastname}`.toLowerCase().includes(lowerCaseQuery);
    const emailMatches = user.email.toLowerCase().includes(lowerCaseQuery);
    const userTypeMatches = user.userType.toString().includes(lowerCaseQuery);

    return usernameMatches || nameMatches || emailMatches || userTypeMatches;
  }), [users, searchQuery]);

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

  return (
    <div className={navStyles.wrapper}>
      <Navigation loggedInUser={loggedInUser} />  

      {/* Main Content */}
      <div className={navStyles.content}>   
        <div className={navStyles.TitleContainer}>
          <h2 className={navStyles['h1-title']}>User Management</h2>  
        </div>
        <div className={styles['separator']}>
          <div className={styles['search-container']}>
            <SearchIcon className={styles['search-icon']} />
            <input
              type="search"
              className={styles['search-input']}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Users"
            />
          </div>

          <button
            className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`}
            onClick={handleAddUser}
          >
            <AddIcon /> Add User
          </button>        
        </div>        
        <div className={styles['user-center-container']}>
          <div className={styles['table-container']}>
            <table className={styles['user-table']}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>User Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr>
                      <td>{user.username}</td>
                      <td>{`${user.firstname} ${user.lastname}`}</td>
                      <td>{user.email}</td>
                      <td>{getUserTypeString(user.userType)}</td>
                      <td className={styles['icon-cell']}>
                        <EditNoteIcon 
                            style={{ marginRight: '15px' }}                    
                            className={styles['action-icon']} 
                            onClick={() => {
                                setSelectedUser(user);
                                handleUpdateUser();
                            }}
                        />
                        <DeleteIcon
                            className={styles['action-icon']} 
                            onClick={() => {
                                setSelectedUser(user);
                                handleDeleteUser();
                            }}
                        />                        
                    </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles['no-results']} style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                      No Results Found...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={confirmDelete}
          message={confirmationMessage}
        />
        <UpdateAccountModal
          isOpen={isUpdateAccountModalOpen}
          onClose={() => {
            setIsUpdateAccountModalOpen(false);
            refreshUsers();
          }}
          userId={selectedUser?.userId}
          user={selectedUser}
          onUpdateSuccess={refreshUsers}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
