import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
} from 'chart.js';

import styles from './Record.module.css';
import navStyles from './Navigation.module.css'; 
import Navigation from './Navigation';
import tableStyles from './GlobalTable.module.css';
import formStyles from './GlobalForm.module.css'

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const Record = () => {
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(authToken);
    const [records, setRecords] = useState([]);
    const [classData, setClassData] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedGrade, setSelectedGrade] = useState(loggedInUser.userType === 3 ? loggedInUser.grade : ''); // Set grade based on user type
    const [selectedSection, setSelectedSection] = useState(loggedInUser.userType === 3 ? loggedInUser.section : ''); // Set section based on user type
    const [uniqueGrades, setUniqueGrades] = useState([]); // To store unique grades
    const [sectionsForGrade, setSectionsForGrade] = useState([]); // Sections based on selected grade
    const [frequencyData, setFrequencyData] = useState({});
    const [monthlyData, setMonthlyData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filteredFrequencyData = selectedGrade ? { [selectedGrade]: frequencyData[selectedGrade] } : frequencyData;
    const exportRef = useRef(); 


    const handleExportToPDF = async () => {
        const element = exportRef.current;

        // Capture the element as an image using html2canvas
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');

        // Create jsPDF document with long bond paper size
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [216, 330], // Long bond paper size in mm
        });

        // Define margins and calculate content dimensions
        const marginTop = 20; // Top margin in mm
        const marginLeft = 10; // Left margin in mm
        const pdfWidth = 216 - 2 * marginLeft; // Width adjusted for margins
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio

        // Add title and custom header (optional)
        pdf.setFontSize(16);
        pdf.text('Student Records', marginLeft, marginTop - 10);

        // Add the image content with margins
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, pdfWidth, pdfHeight);

        // Optional footer
        pdf.setFontSize(10);
        pdf.text('Generated on: ' + new Date().toLocaleDateString(), marginLeft, 330 - 10); // Bottom left corner

        // Save the PDF
        pdf.save('student-records.pdf');
    };

// Fetch initial data (records, classes, school years, unique grades)
useEffect(() => {
    const fetchData = async () => {
        try {
            let recordRes;

            // Check if the logged-in user is an adviser
            if (loggedInUser.userType === 3) {
                // Fetch records based on adviser parameters
                recordRes = await axios.get('http://localhost:8080/student-record/getStudentRecordsByAdviser', {
                    params: {
                        grade: loggedInUser.grade,
                        section: loggedInUser.section,
                        schoolYear: loggedInUser.schoolYear,
                    },
                });
            } else {
                // Fetch all records for other user types
                recordRes = await axios.get('http://localhost:8080/student-record/getAllStudentRecords');
            }

            const [classRes, yearRes, gradeRes] = await Promise.all([
                axios.get('http://localhost:8080/class/getAllClasses'),
                axios.get('http://localhost:8080/schoolYear/getAllSchoolYears'),
                axios.get('http://localhost:8080/class/allUniqueGrades'),
            ]);

            setRecords(recordRes.data);
            setClassData(classRes.data);
            setSchoolYears(yearRes.data);
            setUniqueGrades(gradeRes.data); // Set unique grades
        } catch (err) {
            setError(err.message || 'Error fetching data.');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []); // Add loggedInUser as a dependency


    // Fetch sections for a specific grade when selectedGrade changes
    useEffect(() => {
        const fetchSections = async () => {
            if (selectedGrade) {
                try {
                    const response = await axios.get(`http://localhost:8080/class/sections/${selectedGrade}`);
                    setSectionsForGrade(response.data); // Set sections for selected grade
                } catch (err) {
                    setError(err.message || 'Error fetching sections.');
                }
            } else {
                setSectionsForGrade([]); // Clear sections if no grade is selected
            }
        };

        fetchSections();
    }, [selectedGrade]);

    // Calculate frequency of monitored records based on selected filters
    useEffect(() => {
        if (records.length && classData.length) {
            const frequency = {};
            const monthlyFrequencies = {};

            // Initialize frequency object for each grade in classData
            classData.forEach(cls => {
                frequency[cls.grade] = {
                    Absent: 0,
                    Tardy: 0,
                    'Cutting Classes': 0,
                    'Improper Uniform': 0,
                    Offense: 0,
                    Misbehavior: 0,
                    Clinic: 0,
                    Sanction: 0,
                };
            });

            records.forEach(record => {
                const recordDate = new Date(record.record_date);
                const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
                const day = recordDate.getDate();
                const week = Math.ceil(day / 7);

                // Apply filters: selectedYear, selectedMonth, selectedWeek, selectedGrade, and selectedSection
                const isYearMatch = !selectedYear || record.student.schoolYear === selectedYear;
                const isMonthMatch = !selectedMonth || recordMonth === selectedMonth;
                const isWeekMatch = !selectedWeek || week === parseInt(selectedWeek);
                const isGradeMatch = !selectedGrade || record.student.grade === parseInt(selectedGrade);
                const isSectionMatch = !selectedSection || record.student.section === selectedSection;

                if (isYearMatch && isMonthMatch && isWeekMatch && isGradeMatch && isSectionMatch) {
                    const key = selectedMonth ? day : recordMonth;

                    if (!monthlyFrequencies[key]) {
                        monthlyFrequencies[key] = {
                            Absent: 0,
                            Tardy: 0,
                            'Cutting Classes': 0,
                            'Improper Uniform': 0,
                            Offense: 0,
                            Misbehavior: 0,
                            Clinic: 0,
                            Sanction: 0,
                        };
                    }

                    frequency[record.student.grade][record.monitored_record] += 1;
                    monthlyFrequencies[key][record.monitored_record] += 1;

                    if (record.sanction) {
                        frequency[record.student.grade].Sanction += 1;
                        monthlyFrequencies[key].Sanction += 1;
                    }
                }
            });

            setFrequencyData(frequency);
            setMonthlyData(monthlyFrequencies);
        }
    }, [records, classData, selectedYear, selectedMonth, selectedWeek, selectedGrade, selectedSection]);

    const handleYearChange = (e) => setSelectedYear(e.target.value);
    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setSelectedWeek('');
    };
    const handleWeekChange = (e) => setSelectedWeek(e.target.value);
    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
        setSelectedSection(''); // Reset section when grade changes
    };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);

    const getLineChartData = () => {
        const labels = selectedMonth
            ? Array.from({ length: 31 }, (_, i) => i + 1)
            : ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];

            const datasets = [
                {
                    label: 'Absent',
                    data: labels.map(label => monthlyData[label]?.Absent || 0),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                },
                {
                    label: 'Tardy',
                    data: labels.map(label => monthlyData[label]?.Tardy || 0),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                },
                {
                    label: 'Cutting Classes',
                    data: labels.map(label => monthlyData[label]?.['Cutting Classes'] || 0),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                },
                {
                    label: 'Improper Uniform',
                    data: labels.map(label => monthlyData[label]?.['Improper Uniform'] || 0),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
                {
                    label: 'Offense',
                    data: labels.map(label => monthlyData[label]?.Offense || 0),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                },
                {
                    label: 'Misbehavior',
                    data: labels.map(label => monthlyData[label]?.Misbehavior || 0),
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                },
                {
                    label: 'Clinic',
                    data: labels.map(label => monthlyData[label]?.Clinic || 0),
                    borderColor: 'rgba(75, 192, 192, 0.7)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
                {
                    label: 'Sanction',
                    data: labels.map(label => monthlyData[label]?.Sanction || 0),
                    borderColor: 'rgba(255, 0, 0, 1)',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                },
            ];

        return { labels, datasets };
    };

    if (loading) return <div>Loading records...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />
            <div className={navStyles.content}>
                <div ref={exportRef} className={styles.exportSection}>
                    <div className={navStyles.TitleContainer}>
                        <h2 className={navStyles['h1-title']}>JHS Monitored Records Analytics</h2>
                    </div>         
                    <div className={styles.filterContainer}>
                        <div>
                            <label>Filters:
                            {loggedInUser && loggedInUser.userType !== 3 && (
                                <select id="schoolYear" value={selectedYear} onChange={handleYearChange}>
                                    <option value="">All School Years</option>
                                    {schoolYears.map(year => (
                                        <option key={year.schoolYear_ID} value={year.schoolYear}>
                                            {year.schoolYear}
                                        </option>
                                    ))}
                                </select>
                            )}
                                <select
                                    id="grade"
                                    value={selectedGrade}
                                    onChange={handleGradeChange}
                                    disabled={loggedInUser.userType === 3}
                                >
                                    <option value="">All Grades</option>
                                    {uniqueGrades.map((grade, index) => (
                                        <option key={index} value={grade}>Grade {grade}</option>
                                    ))}
                                </select>

                                {selectedGrade && (
                                        <select
                                            id="section"
                                            value={selectedSection}
                                            onChange={handleSectionChange}
                                            disabled={loggedInUser.userType === 3}
                                        >
                                            <option value="">All Sections</option>
                                            {sectionsForGrade.map((section, index) => (
                                                <option key={index} value={section}>{section}</option>
                                            ))}
                                        </select>
                                )}

                                <select id="month" value={selectedMonth} onChange={handleMonthChange}>
                                    <option value="">All Months</option>
                                    {['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'].map((month, index) => (
                                        <option key={index} value={month}>{month}</option>
                                    ))}
                                </select>

                                {selectedMonth && (
                                        <select id="week" value={selectedWeek} onChange={handleWeekChange}>
                                            <option value="">All Weeks</option>
                                            {[1, 2, 3, 4, 5].map(week => (
                                                <option key={week} value={week}>{`Week ${week}`}</option>
                                            ))}
                                        </select>
                                )}

                            </label>
                        </div>
                        <div>
                            <button 
                                className={`${formStyles['green-button']} ${formStyles['maroon-button']}`} 
                                onClick={handleExportToPDF}>
                                Export to PDF
                            </button>
                        </div>
                    </div>

                    <div className={tableStyles['table-container']}>
                        <table className={tableStyles['global-table']}>
                            <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Absent</th>
                                    <th>Tardy</th>
                                    <th>Cutting Classes</th>
                                    <th>Improper Uniform</th>
                                    <th>Offense</th>
                                    <th>Misbehavior</th>
                                    <th>Clinic</th>
                                    <th>Sanction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(filteredFrequencyData).map(([grade, frequencies]) => (
                                    <tr key={grade}>
                                        <td>{grade}</td>
                                        <td>{frequencies ? frequencies.Absent : 0}</td>
                                        <td>{frequencies ? frequencies.Tardy : 0}</td>
                                        <td>{frequencies ? frequencies['Cutting Classes'] : 0}</td>
                                        <td>{frequencies ? frequencies['Improper Uniform'] : 0}</td>
                                        <td>{frequencies ? frequencies.Offense : 0}</td>
                                        <td>{frequencies ? frequencies.Misbehavior : 0}</td>
                                        <td>{frequencies ? frequencies.Clinic : 0}</td>
                                        <td>{frequencies ? frequencies.Sanction : 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.chartContainer}> {/* This will apply the centering styles */}
                        <div className={styles['linechart-Container']}>
                            <Line
                                data={getLineChartData()}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: { beginAtZero: true },
                                    },
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: {
                                            display: true,
                                            text: selectedMonth ? `Daily Frequencies in ${selectedMonth}` : 'Monthly Frequencies (Aug to May)',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Record;
