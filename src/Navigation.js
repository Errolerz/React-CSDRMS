import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import navStyles from './Navigation.module.css'; // CSS for Navigation
import JHSLogo from './image-sso-yellow.png';
import axios from 'axios';
import NotificationModal from './NotificationModal'; // Import NotificationModal
import MenuPopupState from './Components/MenuPopupState';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Navigation = ({ loggedInUser }) => {
  const { userId } = loggedInUser;
  const navigate = useNavigate();
  const [unviewedCount, setUnviewedCount] = useState(0); // To store count of unviewed notifications
  const [notifications, setNotifications] = useState([]); // All notifications for display
  
  const [showNotificationModal, setShowNotificationModal] = useState(false); // State to control modal visibility
  

  const createSidebarLink = (to, text, IconComponent) => (
    <Link to={to} className={navStyles['styled-link']}>
      <IconComponent className={navStyles.icon} />
      <span>{text}</span>
    </Link>
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/notifications/user/${userId}`);
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
  

  // Handle opening the notification modal
  const handleNotificationClick = () => {
    setShowNotificationModal(true);
  };

  // Handle closing the notification modal
  const handleModalClose = () => {
    setShowNotificationModal(false);
  };

  return (
    <>
      {/* Only render the sidenav title and links if the userType is not 5 */}
      {loggedInUser.userType !== 5 && (
        <div className={navStyles.sidenav}>
          <div className={navStyles['sidenav-title']}>MENU</div>
          {/* Render sidebar links */}
          <>
            {/* SSO - usertype 1 */}
            {loggedInUser.userType === 1 && createSidebarLink("/record", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/student", "Student", SchoolIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/report", "Report", PostAddIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/viewSuspensions", "Suspension", LocalPoliceIcon)}
            {loggedInUser.userType === 1 && createSidebarLink("/activitylog", "Activity Log", AssignmentIcon)}

            {/* Principal - usertype 2 */}
            {loggedInUser.userType === 2 && createSidebarLink("/record", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 2 && createSidebarLink("/viewSuspensions", "Suspension", LocalPoliceIcon)}
            {loggedInUser.userType === 2 && createSidebarLink("/report", "Report", PostAddIcon)}

            {/* Adviser - usertype 3 */}
            {loggedInUser.userType === 3 && createSidebarLink("/record", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 3 && createSidebarLink("/student", "Student", SchoolIcon)}
            {loggedInUser.userType === 3 && createSidebarLink("/report", "Report", PostAddIcon)}

            {/* Admin - usertype 4 */}
            {loggedInUser.userType === 4 && createSidebarLink("/AdminDashboard", "Dashboard", AccountBoxIcon)}
            {loggedInUser.userType === 4 && createSidebarLink("/Class", "Class", SchoolIcon)}
            {loggedInUser.userType === 4 && createSidebarLink("/activitylog", "Activity Log", AssignmentIcon)}

            {/* Guidance - usertype 6 */}
            {loggedInUser.userType === 6 && createSidebarLink("/record", "Dashboard", AssessmentIcon)}
            {loggedInUser.userType === 6 && createSidebarLink("/report", "Report", PostAddIcon)}
          </>
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
            <IconButton onClick={handleNotificationClick}>
              <NotificationsActiveIcon className={navStyles['header-icon']} />
              {unviewedCount > 0 && <span className={navStyles.badge}>{unviewedCount}</span>}
            </IconButton>
          )}
          <MenuPopupState />
        </div>
      </header>

      {/* Render Notification Modal */}
      {showNotificationModal && (
        <NotificationModal 
          onClose={handleModalClose} 
          notifications={notifications} 
          loggedInUser={loggedInUser}
          refreshNotifications={() => setUnviewedCount(0)} // Refresh unviewed count
        />
      )}
    </>
  );
};

export default Navigation;
