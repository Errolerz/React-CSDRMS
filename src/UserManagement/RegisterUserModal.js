import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RegisterUserModal.module.css';
import formStyles from '../GlobalForm.module.css';

const RegisterUserModal = ({ isOpen, onClose, role }) => {
    const [userData, setUserData] = useState({
        userId: '',
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        email: '',
        grade: '',
        section: '',
        schoolYear: '',
        userType: 1 // Default to SSO
    });
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setError('');
            setPasswordStrength(0); // Reset password strength on modal open

            // Fetch grade, section, and school year for Adviser role only
            if (role === 'Adviser') {
                axios.get('http://localhost:8080/class/allUniqueGrades')
                    .then(response => {
                        setGrades(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching grades:', error);
                    });

                axios.get('http://localhost:8080/schoolYear/getAllSchoolYears')
                    .then(response => {
                        setSchoolYears(response.data.map(year => year.schoolYear));
                    })
                    .catch(error => {
                        console.error('Error fetching school years:', error);
                    });
            }

            // Set userType based on role
            setUserData(prevUserData => ({
                ...prevUserData,
                userType: role === 'Principal' ? 2 
                          : role === 'Adviser' ? 3 
                          : role === 'Teacher' ? 5 
                          : role === 'Guidance' ? 6 
                          : 1
            }));
        }
    }, [isOpen, role]);

    const handleGradeChange = (e) => {
        const grade = e.target.value;
        setUserData(prevUserData => ({ ...prevUserData, grade, section: '', schoolYear: '' }));
        axios.get(`http://localhost:8080/class/sections/${grade}`)
            .then(response => {
                setSections(response.data);
            })
            .catch(error => {
                console.error('Error fetching sections:', error);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevUserData => ({ ...prevUserData, [name]: value }));
        
        setUserData((prevUserData) => {
            const updatedUserData = { ...prevUserData, [name]: value };
    
            // Automatically update email when first or last name changes
            if (name === 'firstname' || name === 'lastname') {
                const email = `${updatedUserData.firstname.toLowerCase()}.${updatedUserData.lastname.toLowerCase()}@example.com`;
                updatedUserData.email = email;
            }
    
            return updatedUserData;
        });    

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1; 
        if (password.length >= 12) strength += 1; 
        if (/[A-Z]/.test(password)) strength += 1; 
        if (/[a-z]/.test(password)) strength += 1; 
        if (/[0-9]/.test(password)) strength += 1; 
        if (/[\W_]/.test(password)) strength += 1; 

        return strength; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const minimumPasswordStrength = 5;
        if (passwordStrength < minimumPasswordStrength) {
            alert("Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
            return; 
        }
        
        try {
            // Directly register using the endpoint provided
            const response = await axios.post(`http://localhost:8080/user/registerUser`, userData);
            console.log(response.data);
            alert(`${role} is successfully registered.`);
            setError('');
            setTimeout(() => {
                onClose();
                window.location.reload(); 
            }, 200);
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message;
                if (errorMessage === "Adviser with the same grade, section, and school year already exists") {
                    alert(`${role} with the same school year, grade, and section already exists.`);
                } else if (errorMessage === "Username already exist") {
                    alert("Username already exists. Please use another one");
                } else if (errorMessage === "Principal already exists") {
                    alert("Principal already exists. There should only be one principal");
                } 
            } else {
                setError('An unexpected error occurred.');
            }
            setMessage('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <h2>Register {role}</h2>
                <form onSubmit={handleSubmit} className={formStyles['form-container']}>
                    {message && <p className={formStyles.success}>{message}</p>}
                    {error && <p className={formStyles.error}>{error}</p>}
                    <div className={formStyles['form-group']}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className={formStyles['form-group']}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className={styles['password-strength-container']}>
                        <div className={styles['password-strength-bar']} style={{ width: `${(passwordStrength / 6) * 100}%`, backgroundColor: passwordStrength === 6 ? 'green' : passwordStrength >= 4 ? 'yellow' : 'red' }} />
                    </div>
                    <p className={styles['password-strength-text']}>
                        {passwordStrength === 0 ? '' :
                         passwordStrength < 3 ? 'Weak' :
                         passwordStrength < 5 ? 'Moderate' : 'Strong'}
                    </p>
                    <div className={formStyles['form-group']}>
                        <label htmlFor="firstname">First Name:</label>
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={userData.firstname}
                            onChange={handleChange}
                            placeholder="First Name"
                            required
                        />
                    </div>
                    <div className={formStyles['form-group']}>
                        <label htmlFor="lastname">Last Name:</label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={userData.lastname}
                            onChange={handleChange}
                            placeholder="Last Name"
                            required
                        />
                    </div>
                    <div className={formStyles['form-group']}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>
                    {role === 'Adviser' && (
                        <>
                            <div className={formStyles['form-group']}>
                                <label htmlFor="grade">Grade:</label>
                                <select
                                    id="grade"
                                    name="grade"
                                    value={userData.grade}
                                    onChange={handleGradeChange}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {grades.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={formStyles['form-group']}>
                                <label htmlFor="section">Section:</label>
                                <select
                                    id="section"
                                    name="section"
                                    value={userData.section}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={formStyles['form-group']}>
                                <label htmlFor="schoolYear">School Year:</label>
                                <select
                                    id="schoolYear"
                                    name="schoolYear"
                                    value={userData.schoolYear}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select School Year</option>
                                    {schoolYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <div className={formStyles['global-buttonGroup']}>
                        <button 
                            type="submit" 
                            className={formStyles['green-button']}>Register
                        </button>
                        <button 
                            onClick={onClose} 
                            className={`${formStyles['green-button']} ${formStyles['red-button']}`}>Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterUserModal;
