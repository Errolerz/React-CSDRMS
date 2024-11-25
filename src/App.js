import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import BrowserRouter, Route, and Routes
import LoginPage from './LoginPage';
import './App.css';
import Notification from './Notification';
import Dashboard from './Dashboard/Dashboard';
import Record from './Record/Record';

import Student from './Student/Student'
// import ViewReport from './ViewReport'; 


import AddStudentRecord from './SSO/AddStudentRecord';


import Suspension from './Suspension/Suspension';


import UpdateAccount from './UpdateAccount';

// Admin Pages
import UserManagement from './UserManagement/UserManagement';
import Class from './Class/Class';
import ActivityLog from './ActivityLog';


import PrivateRoute from './PrivateRoute';
import { AuthContext, AuthProvider } from './AuthContext';
import PageNotFound from './PageNotFound';


function App() {
  const { loggedInUser } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<LoginPage/>} />

          {loggedInUser && (
            <>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/UpdateAccount" element={<UpdateAccount />} /> 
            </>

          )}

          {loggedInUser && loggedInUser.userType === 1 && (
            <>
            </>

          )}

          {(loggedInUser && (loggedInUser.userType === 1 ||  loggedInUser.userType === 2))&& (
            <>
              <Route path="/suspension" element={<Suspension />} />
             <Route path="/activitylog" element={<PrivateRoute element={<ActivityLog />} />} />
            </>

          )}

          {loggedInUser && loggedInUser.userType === 3 && (
            <>
           
            
            </>
          )}

          {loggedInUser && loggedInUser.userType === 4 && (
            <>
              <Route path="/UserManagement" element={<PrivateRoute element={<UserManagement />} />} />
              <Route path="/Class" element={<PrivateRoute element={<Class />} />} />
              <Route path="/activitylog" element={<PrivateRoute element={<ActivityLog />} />} />
            </>
          )}

          {(loggedInUser && (loggedInUser.userType === 1 || loggedInUser.userType === 3)) && (
            <>
            <Route path="/notification" element={<Notification />} />
            <Route path="/student" element={<Student />}  />
            {/*<Route path="/student" element={<PrivateRoute element={<Student />} />}  /> */}
            <Route path="/add-record/:sid" element={<AddStudentRecord />} /> 
            </>

          )}

          {(loggedInUser && (loggedInUser.userType !== 4)) && (
            <>
            <Route path="/record" element={<Record />} />
            {/* <Route path="/view-report/:reportId" element={<ViewReport />} />  */}
            </>

          )}
          <Route path ="*" element={<PageNotFound/>}/>

        </Routes>
      </div>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
