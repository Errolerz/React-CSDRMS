import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import BrowserRouter, Route, and Routes

import './App.css';

import LoginPage from './LoginPage/LoginPage';
import Dashboard from './Dashboard/Dashboard';
import Record from './Record/Record';

// Student Records
import Student from './Student/Student';

//Student List
import StudentList from './Student/StudentList';

import Suspension from './Suspension/Suspension';


// Admin Pages
import UserManagement from './UserManagement/UserManagement';
import Class from './Class/Class';
import ActivityLog from './ActivityLog/ActivityLog';


import PrivateRoute from './PrivateRoute';
import { AuthContext, AuthProvider } from './LoginPage/AuthContext';
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

            </>

          )}

          {loggedInUser && loggedInUser.userType === 1 && (
            <>
              <Route path="/StudentList" element={<PrivateRoute element={<StudentList />} />} />
              <Route path="/activitylog" element={<PrivateRoute element={<ActivityLog />} />} />
            </>

          )}

          {(loggedInUser && (loggedInUser.userType === 1 ||  loggedInUser.userType === 2))&& (
            <>
              <Route path="/suspension" element={<Suspension />} />
            </>

          )}

          {loggedInUser && loggedInUser.userType === 3 && (
            <>
              <Route path="/StudentList" element={<PrivateRoute element={<StudentList />} />} />            
            </>
          )}

          {loggedInUser && loggedInUser.userType === 4 && (
            <>
              <Route path="/UserManagement" element={<PrivateRoute element={<UserManagement />} />} />
              <Route path="/StudentList" element={<PrivateRoute element={<StudentList />} />} />
              <Route path="/Class" element={<PrivateRoute element={<Class />} />} />
              <Route path="/activitylog" element={<PrivateRoute element={<ActivityLog />} />} />
            </>
          )}

          {(loggedInUser && (loggedInUser.userType === 1 || loggedInUser.userType === 3 || loggedInUser.userType ===  6)) && (
            <>
            <Route path="/student" element={<Student />}  />
            </>

          )}

          {(loggedInUser && (loggedInUser.userType !== 4)) && (
            <>
            <Route path="/record" element={<Record />} />
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
