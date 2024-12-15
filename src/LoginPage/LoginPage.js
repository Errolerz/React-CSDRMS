import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { AuthContext } from './AuthContext';
import styles from "./LoginPage.module.css";
import Loader from '../Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    document.title = "JHS Success Hub | Login";
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        const authTokenObj = JSON.parse(authToken);
        if (!authTokenObj) {
          navigate('/');
        } else {
          const { userType, userObject } = authTokenObj;
          switch (userType) {
            case 1:
            case 2:
            case 3:
              navigate('/dashboard', { state: { userObject } });
              break;
            case 4:
              navigate('/UserManagement', { state: { userObject } });
              break;
            case 5:
              navigate('/record', { state: { userObject } }); // Redirect for userType 5
              break;
            case 6:
              navigate('/dashboard', { state: { userObject } }); // Redirect for userType 6
              break;  
            default:
              navigate('/');
          }
        }
      } catch (error) {
        console.error('Error parsing authToken:', error);
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader when login starts
    try {
      const response = await axios.post('http://localhost:8080/user/login', {
        username,
        password,
      });
  
      if (!response.data.userType) {
        alert('Incorrect Username or Password');
        setLoading(false); // Hide loader on error
        return;
      }
  
      const authTokenString = JSON.stringify(response.data);
      localStorage.setItem('authToken', authTokenString);
  
      const { userType, userObject } = response.data;
      login(response.data); // Update context
     
      // Only log time if the userType is 3
      const loginTime = new Date().toISOString(); // Get current time in ISO format
      await axios.post('http://localhost:8080/time-log/login', {
        userId: response.data.userId, // Assuming userObject contains uid
        loginTime: loginTime,
      });
  
      // Redirect based on userType
      switch (userType) {
        case 1:
        case 2:
        case 3:
          navigate('/dashboard', { state: { userObject } });
          break;
        case 4:
          navigate('/UserManagement', { state: { userObject } });
          break;
        case 5:
          navigate('/record', { state: { userObject } }); // Redirect for userType 5
          break;
        case 6:
          navigate('/dashboard', { state: { userObject } }); // Redirect for userType 6
          break;  
        default:
          alert('Incorrect Username or Password');
      }
    } catch (error) {
      console.error('Login Failed', error.response.data);
      alert('Incorrect Username or Password');
      setLoading(false); // Hide loader on error
    }
  };

  const handleUsernameChange = (e) => {
    const updatedUsername = e.target.value.replace(/\s+/g, ''); // Remove spaces
    setUsername(updatedUsername);
  };

  return (
    <div className={styles.loginbg}>
      <div className={styles.titleImage}></div>
      <div className={styles.ssoImage}></div>
      <div className={styles.container}>
        <div className={styles.form_area}>
          <p className={styles.title}>User Authentication</p>
          <form onSubmit={handleLogin}>
            <div className={styles.form_group}>
              <label className={styles.sub_title} htmlFor="username">Username</label>
              <input
                className={styles.form_style}
                type="user"
                value={username}
                onChange={handleUsernameChange}
                required
              />
            </div>
            <div className={styles.form_group}>
              <label className={styles.sub_title} htmlFor="password">Password</label>
              <input
                className={styles.form_style}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.btn}>LOGIN</button>
          </form>
        </div>
      </div>
      
      {/* Loader: Display when loading state is true */}
      {loading && <div className={styles.loaderOverlay}><Loader /></div>}
    </div>
  );
};

export default LoginPage;
