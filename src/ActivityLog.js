import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActivityLog.module.css'; // Import your CSS module here
import navStyles from './Navigation.module.css'; 
import Navigation from './Navigation';
import tableStyles from './GlobalTable.module.css';

const ActivityLog = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

        fetchActivityLogs();
    }, []);

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
            <h2>Activity Logs</h2>
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
    </div>
    );
};

export default ActivityLog;
