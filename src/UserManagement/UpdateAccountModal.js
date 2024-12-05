    import React, { useState, useEffect, useCallback } from 'react';
    import ReactDOM from 'react-dom';
    import axios from 'axios';
    import styles from './RegisterUserModal.module.css';
    import styles1 from '../GlobalForm.module.css';
    import buttonStyles from '../GlobalButton.module.css';

    const UpdateAccountModal = ({ isOpen, onClose, userId, user }) => {
        const authToken = localStorage.getItem('authToken');
        const loggedInUser = authToken ? JSON.parse(authToken) : null;
        const [grades, setGrades] = useState([]);
        const [sections, setSections] = useState([]);
        const [schoolYears, setSchoolYears] = useState([]);

        const [userType, setUserType] = useState(null);
        const [updatedUser, setUpdatedUser] = useState({
            username: '',
            password: '',
            firstname: '',
            lastname: '',
            email: '',
            userType: null,
            schoolYear: '',
            grade: null,
            section: ''
        });
        const [passwordStrength, setPasswordStrength] = useState(0);

        const fetchDynamicData = async () => {
            try {
                const gradesResponse = await axios.get('http://localhost:8080/class/allUniqueGrades');
                setGrades(gradesResponse.data);

                const schoolYearsResponse = await axios.get('http://localhost:8080/schoolYear/getAllSchoolYears');
                setSchoolYears(schoolYearsResponse.data);
            } catch (error) {
                console.error('Error fetching dynamic data:', error);
            }
        };

        const handleGradeChange = useCallback(async (event) => {
            const selectedGrade = event.target.value;
            setUpdatedUser((prevUser) => ({ ...prevUser, grade: selectedGrade }));
            
            try {
                const sectionsResponse = await axios.get(`http://localhost:8080/class/sections/${selectedGrade}`);
                setSections(sectionsResponse.data);
        
                // Preserve the previously selected section if it matches the new grade
                if (updatedUser.section) {
                    setUpdatedUser((prevUser) => ({ ...prevUser, section: prevUser.section }));
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }, [updatedUser.section]);
        
        useEffect(() => {
            if (isOpen && user) {
                console.log(user);  // Log the user object
                setUpdatedUser({
                    username: user.username,
                    password: '',
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    userType: user.userType,
                    schoolYear: user.schoolYear || '',
                    grade: user.grade || null,
                    section: user.section || ''
                });
                setUserType(user.userType);
                fetchDynamicData();
        
                if (user.grade) {
                    handleGradeChange({ target: { value: user.grade } });
                }
            }
        }, [isOpen, user, handleGradeChange]);
        
        const handleInputChange = (event) => {
            const { name, value } = event.target;
            setUpdatedUser({ ...updatedUser, [name]: value });

            if (name === 'password') {
                setPasswordStrength(calculatePasswordStrength(value));
            }
        };

        const handleUpdate = () => {
            const updatedData = { ...updatedUser, userId };
            updatedData.username = user.username;
            if (updatedData.password === '') {
                delete updatedData.password;
            } else {
                const passwordStrength = calculatePasswordStrength(updatedData.password);
                const minimumPasswordStrength = 5;

                if (passwordStrength < minimumPasswordStrength) {
                    alert("Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
                    return;
                }
            }

            axios.put(`http://localhost:8080/user/updateUser/${userId}/${loggedInUser.userId}`, updatedData)
                .then(response => {
                    console.log(response.data);
                    alert('Account Successfully Updated');

                    if (updatedUser.username === loggedInUser.username) {
                        localStorage.setItem('authToken', JSON.stringify(updatedData));
                    }

                    onClose();
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    alert('Error updating account. Please try again.');
                });
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

        if (!isOpen) return null;

        return ReactDOM.createPortal(
            <div className={styles['modal-overlay']} onClick={onClose}>
                <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                    <h2>Update Account</h2>
                    <form className={styles1['form-container']}>
                        <div className={styles1['form-group']}>
                            <label>Username:</label>
                            <input type="text" name="username" value={updatedUser.username} onChange={handleInputChange} disabled style={{ cursor: 'not-allowed' }} />
                        </div>
                        <div className={styles1['form-group']}>
                            <label>Password:</label>
                            <input type="password" name="password" value={updatedUser.password} onChange={handleInputChange} />
                        </div>
                        <div className={styles['password-strength-container']}>
                            <div className={styles['password-strength-bar']} style={{ width: `${(passwordStrength / 6) * 100}%`, backgroundColor: passwordStrength === 6 ? 'green' : passwordStrength >= 4 ? 'yellow' : 'red' }} />
                        </div>
                        <p className={styles['password-strength-text']}>
                            {passwordStrength === 0 ? '' :
                                passwordStrength < 3 ? 'Weak' :
                                passwordStrength < 5 ? 'Moderate' : 'Strong'}
                        </p>
                        <div className={styles1['form-group']}>
                            <label>First Name:</label>
                            <input type="text" name="firstname" value={updatedUser.firstname} onChange={handleInputChange} />
                        </div>
                        <div className={styles1['form-group']}>
                            <label>Last Name:</label>
                            <input type="text" name="lastname" value={updatedUser.lastname} onChange={handleInputChange} />
                        </div>
                        <div className={styles1['form-group']}>
                            <label>Email:</label>
                            <input type="email" name="email" value={updatedUser.email} onChange={handleInputChange} />
                        </div>
                        {userType === 3 && (
                            <div>
                                <div className={styles1['form-group']}>
                                    <label>School Year:</label>
                                    <select name="schoolYear" value={updatedUser.schoolYear} onChange={handleInputChange}>
                                        <option value="">Select School Year</option>
                                        {schoolYears.map(sy => (
                                            <option key={sy.schoolYear_ID} value={sy.schoolYear}>{sy.schoolYear}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles1['form-group']}>
                                    <label>Grade:</label>
                                    <select name="grade" value={updatedUser.grade} onChange={handleGradeChange}>
                                        <option value="">Select Grade</option>
                                        {grades.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles1['form-group']}>
                                    <label>Section:</label>
                                    <select name="section" value={updatedUser.section} onChange={handleInputChange}>
                                        <option value="">Select Section</option>
                                        {sections.map(section => (
                                            <option key={section} value={section}>{section}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className={buttonStyles['button-group']}>
                            <button type="button" className={`${buttonStyles['action-button']} ${buttonStyles['green-button']}`} 
                                onClick={handleUpdate}>Update
                            </button>
                            <button type="button" className={`${buttonStyles['action-button']} ${buttonStyles['red-button']}`} 
                                onClick={onClose}>Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        );
    };

    export default UpdateAccountModal;
