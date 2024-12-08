import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import navStyles from './Navigation.module.css'; // CSS for Navigation
import NotificationModal from './NotificationModal'; // Import NotificationModal
import MenuPopupState from './MenuPopupState';

import JHSLogo from '../LoginPage/image-sso-yellow.png';

import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTimeFilled';

const Navigation = ({ loggedInUser }) => {
  const { userId } = loggedInUser;
  const navigate = useNavigate();
  const location = useLocation(); // To get the current URL path
  const [unviewedCount, setUnviewedCount] = useState(0); // To store count of unviewed notifications
  const [notifications, setNotifications] = useState([]); // All notifications for display
  const [notificationToggle, setNotificationToggle] = useState(false);

  const createSidebarLink = (to, text, IconComponent) => {
    const isActive = location.pathname === to; // Check if the link is active

    // Set styles for active link
    const linkStyles = `${navStyles['styled-link']} ${isActive ? navStyles.active : ''}`;

    return (
      <Link to={to} className={linkStyles}>
        <IconComponent className={navStyles.icon} />
        <span>{text}</span>
      </Link>
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`https://spring-csdrms-g8ra.onrender.com/notifications/user/${userId}`);
        const notificationsData = response.data;

        notificationsData.sort((a, b) => b.userNotificationId - a.userNotificationId);
        // Filter unviewed notifications and set count
       
        const unviewedNotifications = notificationsData.filter(notification => !notification.viewed);
       
        setUnviewedCount(unviewedNotifications.length);
  
        // Set all notifications for modal display
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
  
    fetchNotifications();
  }, [userId]);
  
  const handleToggleNotification = () =>{
    if(notificationToggle) setNotificationToggle(false); else setNotificationToggle(true);
  }

  // Handle closing the notification modal
  const handleModalClose = () => {
    setNotificationToggle(false);
  };

  return (
    <>
      {/* Only render the sidenav title and links if the userType is not 5 */}
      {loggedInUser.userType !== 5 && (
        <div className={navStyles.sidenav}>
          <div className={navStyles['sidenav-title']}>MENU</div>
          {/* Render sidebar links */
           /* SSO - usertype 1 */}
            {loggedInUser.userType === 1 && createSidebarLink("/dashboard", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/student", "Student", SchoolIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/record", "Record", PostAddIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/suspension", "Suspension", LocalPoliceIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/activitylog", "Activity Log", AccessTimeIcon)}

            {/* Principal - usertype 2 */}
            {loggedInUser.userType === 2 && createSidebarLink("/dashboard", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 2 && createSidebarLink("/suspension", "Suspension", LocalPoliceIcon)}
            {loggedInUser.userType === 2 && createSidebarLink("/record", "Complaint", PostAddIcon)}

            {/* Adviser - usertype 3 */}
            {loggedInUser.userType === 3 && createSidebarLink("/dashboard", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 3 && createSidebarLink("/student", "Student", SchoolIcon)}
            {loggedInUser.userType === 3 && createSidebarLink("/record", "Record", PostAddIcon)}

            {/* Admin - usertype 4 */}
            {loggedInUser.userType === 4 && createSidebarLink("/UserManagement", "Users", AccountBoxIcon)}
            {loggedInUser.userType === 4 && createSidebarLink("/Class", "Class", SchoolIcon)}
            {loggedInUser.userType === 4 && createSidebarLink("/StudentList", "Student List", AssignmentIcon)}
            {loggedInUser.userType === 4 && createSidebarLink("/activitylog", "Activity Log", AccessTimeIcon)}

            {/* Guidance - usertype 6 */}
            {loggedInUser.userType === 6 && createSidebarLink("/dashboard", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 6 && createSidebarLink("/record", "Complaint", PostAddIcon)}
        </div>
      )}

      {/* Header */}
      <header className={navStyles.header}>
        <div className={navStyles.JHSheaderContainer}>
          <img src={JHSLogo} alt="JHS Logo" className={navStyles.JHSLogo} />
          <span className={navStyles.JHSTitle}>JHS Success Hub</span>
        </div>

        <div className={navStyles['header-wrapper']}>
          {/* Notification Icon */}
          {loggedInUser?.userType !== 4 && (
            <IconButton onClick={handleToggleNotification}>
              <NotificationsActiveIcon className={navStyles['header-icon']} />
              {unviewedCount > 0 && <span className={navStyles.badge}>{unviewedCount}</span>}
            </IconButton>
          )}
          <MenuPopupState />
        </div>
      </header>

      {/* Render Notification Modal */}
      {notificationToggle && (
        <NotificationModal 
          onClose={handleModalClose} 
          notifications={notifications} 
          loggedInUser={loggedInUser}
          setNotifications={setNotifications}
          refreshNotifications={() => setUnviewedCount(0)} // Refresh unviewed count
        />
      )}
    </>
  );
};

export default Navigation;
