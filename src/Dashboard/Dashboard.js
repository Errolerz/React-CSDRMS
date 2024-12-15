import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    registerables,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import styles from '../Dashboard/Dashboard.module.css';
import navStyles from '../Components/Navigation.module.css'; 
import Navigation from '../Components/Navigation';
import tableStyles from '../GlobalTable.module.css';
import buttonStyles from '../GlobalButton.module.css'

import Loader from '../Loader';
import ExportIcon from '@mui/icons-material/FileUpload';

// Register Chart.js components and plugins
ChartJS.register(
    ...registerables,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels // Register the DataLabels plugin
);

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
    const [selectedChartType, setSelectedChartType] = useState('line'); // New state for chart type selection

    const filteredFrequencyData = selectedGrade ? { [selectedGrade]: frequencyData[selectedGrade] } : frequencyData;
    const exportRef = useRef(); 

    useEffect(() => {
        if (!loggedInUser) return;
    
        console.log('loggedInUser.userType:', loggedInUser?.userType); // Debug log
    
        const userTypeTitles = {
            1: 'SSO',
            2: 'Principal',
            3: 'Adviser',
            5: 'Teacher',
            6: 'Guidance',
        };
    
        const userTypeTitle = userTypeTitles[loggedInUser?.userType] || 'Unknown';
        document.title = `${userTypeTitle} | Dashboard`;
        }, [loggedInUser]);


        const handleExportToPDF = async () => {
            const element = exportRef.current;
        
            const exportButton = document.getElementById('exportToPDFButton');
            let originalDisplay = '';
        
            if (exportButton) {
                // Save original display value
                originalDisplay = getComputedStyle(exportButton).display;
                // Hide the export button
                exportButton.style.display = 'none';
            }
        
            // Capture the element as an image using html2canvas
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');
        
            if (exportButton) {
                // Restore the original display value
                exportButton.style.display = originalDisplay;
            }
        
            // Create jsPDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [216, 279], // Letter size in mm
            });
        
            // Define margins and content dimensions
            const topMargin = 15;
            const sideMargin = 27.4;
            const pdfContentWidth = 216 - 2 * sideMargin;
            const pdfContentHeight = 279 - topMargin - sideMargin;
            const imgHeight = (canvas.height * pdfContentWidth) / canvas.width;
            const adjustedImgHeight = Math.min(imgHeight, pdfContentHeight);
        
            // Add content to the PDF
            pdf.addImage(imgData, 'PNG', sideMargin, topMargin, pdfContentWidth, adjustedImgHeight);
        
            // Footer
            pdf.setFontSize(10);
            pdf.text('Generated on: ' + new Date().toLocaleDateString(), sideMargin, 279 - sideMargin + 5);
        
            // Save PDF
            pdf.save('JHS-Monitored-Records.pdf');
        };
        
        
    // Fetch initial data (records, classes, school years, unique grades)
    useEffect(() => {
        const fetchData = async () => {
            try {
                let recordRes;

                // Check if the logged-in user is an adviser
                if (loggedInUser.userType === 3) {
                    // Fetch records based on adviser parameters
                    recordRes = await axios.get('http://localhost:8080/record/getStudentRecordsByAdviser', {
                        params: {
                            grade: loggedInUser.grade,
                            section: loggedInUser.section,
                            schoolYear: loggedInUser.schoolYear,
                        },
                    });
                } else {
                    // Fetch all records for other user types
                    recordRes = await axios.get('http://localhost:8080/record/getAllRecords');
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
    }, [
        loggedInUser.grade, 
        loggedInUser.schoolYear, 
        loggedInUser.section, 
        loggedInUser.userType
    ]); // Add the missing dependencies
    
    // Fetch sections for a specific grade when selectedGrade changes
    useEffect(() => {
        const fetchSections = async () => {
            if (selectedGrade) {
                try {
                    const response = await axios.get(`http://localhost:8080/class/sections/${selectedGrade}`);
                    setSectionsForGrade(response.data.map(section => section.toUpperCase())); 
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
                    'Request Permit': 0,
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
                const isSectionMatch = !selectedSection || record.student.section.toUpperCase() === selectedSection.toUpperCase();


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
                            'Request Permit': 0,
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

    // New: Filter studentRecords by selectedGrade and selectedSection
    const filteredData = useMemo(() => {
        const filteredRecords = records.filter(record => {
          const recordDate = new Date(record.record_date);
          const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
          const week = Math.ceil(recordDate.getDate() / 7);
      
          return (
            (!selectedGrade || record.student.grade === parseInt(selectedGrade)) &&
            (!selectedSection || record.student.section.toUpperCase() === selectedSection.toUpperCase()) &&
            (!selectedMonth || recordMonth === selectedMonth) &&
            (!selectedWeek || week === parseInt(selectedWeek))
          );
        });
      
        const studentCounts = filteredRecords.reduce((acc, record) => {
          const studentName = record.student.name;
          if (!acc[studentName]) {
            acc[studentName] = {
              Absent: 0,
              Tardy: 0,
              'Cutting Classes': 0,
              'Improper Uniform': 0,
              Offense: 0,
              Misbehavior: 0,
              Clinic: 0,
              'Request Permit': 0,
              SanctionFrequency: 0,
            };
          }
          acc[studentName][record.monitored_record]++;
          if (record.sanction) {
            acc[studentName].SanctionFrequency++;
          }
          return acc;
        }, {});
      
        return studentCounts;
      }, [records, selectedGrade, selectedSection, selectedMonth, selectedWeek]);

        const classOverviewTable = 
        Object.entries(filteredData).length > 0 ? (
            Object.entries(filteredData).map(([studentName, counts]) => (
                <tr key={studentName}>
                    <td style={{ width: '350px', textAlign:'left' }}>{studentName}</td>
                    <td>{counts.Absent}</td>
                    <td>{counts.Tardy}</td>
                    <td>{counts['Cutting Classes']}</td>
                    <td>{counts['Improper Uniform']}</td>
                    <td>{counts.Offense}</td>
                    <td>{counts.Misbehavior}</td>
                    <td>{counts.Clinic}</td>
                    <td>{counts['Request Permit']}</td>
                    <td>{counts.SanctionFrequency}</td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                    No records found.
                </td>
            </tr>
        )
        const classOverviewTableByMonth = 
        Object.entries(filteredData).length > 0 ? (
            Object.entries(filteredData).map(([studentName, counts]) => (
                <tr key={studentName}>
                    <td style={{ width: '350px' }}>{studentName}</td>
                    <td>{counts.Absent}</td>
                    <td>{counts.Tardy}</td>
                    <td>{counts['Cutting Classes']}</td>
                    <td>{counts['Improper Uniform']}</td>
                    <td>{counts.Offense}</td>
                    <td>{counts.Misbehavior}</td>
                    <td>{counts.Clinic}</td>
                    <td>{counts['Request Permit']}</td>
                    <td>{counts.SanctionFrequency}</td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                    No records found.
                </td>
            </tr>
        )

        const getChartData = () => {
            const labels = selectedMonth
                ? Array.from({ length: 31 }, (_, i) => i + 1)
                : ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
        
            const datasets = [
                {
                    label: 'Absent',
                    data: labels.map(label => monthlyData[label]?.Absent || 0),
                    borderColor: '#FF0000',  // Red
                    backgroundColor: '#FF0000', // Light Red
                },
                {
                    label: 'Tardy',
                    data: labels.map(label => monthlyData[label]?.Tardy || 0),
                    borderColor: '#FF7F00',  // Orange
                    backgroundColor: '#FF7F00', // Light Orange
                },
                {
                    label: 'Cutting Classes',
                    data: labels.map(label => monthlyData[label]?.['Cutting Classes'] || 0),
                    borderColor: '#FFFF00',  // Yellow
                    backgroundColor: '#FFFF00', // Light Yellow
                },
                {
                    label: 'Improper Uniform',
                    data: labels.map(label => monthlyData[label]?.['Improper Uniform'] || 0),
                    borderColor: '#008000',  // Green
                    backgroundColor: '#008000', // Green
                },
                {
                    label: 'Offense',
                    data: labels.map(label => monthlyData[label]?.Offense || 0),
                    borderColor: '#0000FF',  // Blue
                    backgroundColor: '#0000FF', // Light Blue
                },
                {
                    label: 'Clinic',
                    data: labels.map(label => monthlyData[label]?.Clinic || 0),
                    borderColor: '#EE82EE',  // Violet
                    backgroundColor: '#EE82EE', // Light Violet
                },
                {
                    label: 'Request Permit',
                    data: labels.map(label => monthlyData[label]?.['Request Permit'] || 0),
                    borderColor: '#8B4513',  // Brown
                    backgroundColor: '#8B4513', // Light Brown
                },
                {
                    label: 'Sanction',
                    data: labels.map(label => monthlyData[label]?.Sanction || 0),
                    borderColor: '#000000',  // Black
                    backgroundColor: '#000000', // Light Black
                },
            ];
        
            // Conditionally add 'Misbehavior' dataset or combine 'Offense' and 'Misbehavior' data for userType === 2
            if (loggedInUser.userType !== 2) {
                datasets.splice(5, 0, { // Insert 'Misbehavior' after 'Offense'
                    label: 'Misbehavior',
                    data: labels.map(label => monthlyData[label]?.Misbehavior || 0),
                    borderColor: '#4B0082',  // Indigo
                    backgroundColor: '#4B0082', // Light Indigo
                });
            } else {
                // If userType is 2, combine 'Offense' and 'Misbehavior' data into 'Offense'
                datasets[4].data = labels.map((label, index) => {
                    return (monthlyData[label]?.Offense || 0) + (monthlyData[label]?.Misbehavior || 0);
                });
                datasets[4].label = 'Offense'; // Update the label to reflect combined data
            }
        
            return { labels, datasets };
        };
        
        
        const getChartPieData = () => {
            // Define the labels and dataset order
            const labels = [
                'Absent',
                'Tardy',
                'Cutting Classes',
                'Improper Uniform',
                'Clinic',
                'Request Permit',
                'Sanction',
            ];
        
            // Define the colors for the chart
            const backgroundColors = [
                '#FF0000', // Absent (Red)
                '#FF7F00', // Tardy (Orange)
                '#FFFF00', // Cutting Classes (Yellow)
                '#008000', // Improper Uniform (Green)
                '#9400D3', // Clinic (Violet)
                'rgba(139, 69, 19, 1)', // Sanction (Brownish)
                '#000000', // Request Permit (Black)
            ];
        
            const borderColors = [
                '#FF0000', // Absent (Red)
                '#FF7F00', // Tardy (Orange)
                '#FFFF00', // Cutting Classes (Yellow)
                '#008000', // Improper Uniform (Green)
                '#9400D3', // Clinic (Violet)
                'rgba(139, 69, 19, 1)', // Sanction (Brownish)
                '#000000', // Request Permit (Black)
            ];
        
            // Initialize the dataset with the required frequency sums
            const data = [
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Absent, 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Tardy, 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies['Cutting Classes'], 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies['Improper Uniform'], 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Clinic, 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies['Request Permit'], 0),
                Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Sanction, 0),
            ];
        
            // Conditionally add 'Offense' and 'Misbehavior' data if the user is not type 2
            if (loggedInUser.userType !== 2) {
                labels.splice(4, 0, 'Offense', 'Misbehavior'); // Insert 'Offense' and 'Misbehavior' after 'Improper Uniform'
                backgroundColors.splice(4, 0, '#0000FF', '#4B0082'); // Add respective colors
                borderColors.splice(4, 0, '#0000FF', '#4B0082'); // Add respective border colors
                data.splice(4, 0,
                    Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Offense, 0),
                    Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Misbehavior, 0)
                );
            } else {
                // If userType is 2, combine Offense and Misbehavior into Offense
                labels.splice(4, 1, 'Offense'); // Replace 'Offense' label at index 4
                backgroundColors.splice(4, 1, '#0000FF'); // Replace the color for 'Offense'
                borderColors.splice(4, 1, '#0000FF'); // Replace the border color for 'Offense'
        
                // Combine 'Offense' and 'Misbehavior' data
                const combinedOffenseMisbehavior = Object.values(filteredFrequencyData).reduce((sum, frequencies) => sum + frequencies.Offense + frequencies.Misbehavior, 0);
                data.splice(4, 1, combinedOffenseMisbehavior); // Replace the data at index 4 with the combined value
            }
        
            // Return the pie chart data object
            const pieData = {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1,
                    },
                ],
            };
        
            return pieData;
        };
        
        
        const handleChartTypeChange = (e) => {
            setSelectedChartType(e.target.value);
        };

    return (
        <div className={navStyles.wrapper}>
            <Navigation loggedInUser={loggedInUser} />
            <div className={navStyles.content}>
                <div ref={exportRef} className={styles.exportSection}>
                    <div className={navStyles.TitleContainer}>
                        <h2 className={navStyles['h1-title']}>JHS Monitored Records</h2>
                        {loggedInUser.userType === 1 && (
                            <div className={buttonStyles['button-group']} style={{marginTop: '0px'}}>
                                <button 
                                    id="exportToPDFButton"
                                    className={`${buttonStyles['action-button']} ${buttonStyles['maroon-button']}`} 
                                    onClick={handleExportToPDF}>
                                    <ExportIcon /> Export to PDF
                                </button>
                            </div>
                        )}
                    </div>         
                    <div className={styles.filters}>
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
                                            value={selectedSection.toUpperCase()}
                                            onChange={handleSectionChange}
                                            disabled={loggedInUser.userType === 3}
                                        >
                                            <option value="">All Sections</option>
                                            {sectionsForGrade.map((section, index) => (
                                                <option key={index} value={section.toUpperCase()}>{section}</option>
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
                                <select id="chartType" value={selectedChartType} onChange={handleChartTypeChange}>
                                    <option value="line">Line Chart</option>
                                    <option value="bar">Bar Chart</option>
                                    <option value="pie">Pie Chart</option>
                                </select>

                            </label>
                        </div>
                    </div>

                    <>                
                        <h2 className={styles['Dashboard-title']}>Total Records Overview</h2>
                        <div className={tableStyles['table-container']}>
                            <table className={tableStyles['global-table']}>
                                <thead>
                                    <tr>
                                        {selectedGrade && selectedSection ? null : <th>Grade</th>}
                                        <th>Absent</th>
                                        <th>Tardy</th>
                                        <th>Cutting Classes</th>
                                        <th>Improper Uniform</th>
                                        {loggedInUser && loggedInUser.userType !== 2 && (
                                            <>
                                                <th>Offense</th> {/* OFFENSE || Policy Violation */}
                                                <th>Misbehavior</th> {/* MISBEHAVIOR */}
                                            </>
                                        )}
                                        {loggedInUser && loggedInUser.userType === 2 && (
                                            <>
                                                <th>Offense</th> {/* OFFENSE || Policy Violation */}
                                            </>
                                        )}
                                        <th>Clinic</th> {/* CLINIC */}
                                        <th>Request Permit</th>
                                        <th>Sanction</th>
                                        <th style={{ borderRight: '0.5px solid #8A252C' }}>Total</th> {/* New Total Column */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFrequencyData && Object.entries(filteredFrequencyData).length === 0 ? (
                                        <tr>
                                            <td colSpan={loggedInUser && loggedInUser.userType !== 2 ? 11 : 10} style={{ textAlign: 'center' }}>
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {Object.entries(filteredFrequencyData).map(([grade, frequencies]) => {
                                                const rowTotal =
                                                    (frequencies?.Absent || 0) +
                                                    (frequencies?.Tardy || 0) +
                                                    (frequencies?.['Cutting Classes'] || 0) +
                                                    (frequencies?.['Improper Uniform'] || 0) +
                                                    (frequencies?.Clinic || 0) +
                                                    (frequencies?.['Request Permit'] || 0) +
                                                    (frequencies?.Sanction || 0) +
                                                    (loggedInUser && loggedInUser.userType !== 2
                                                        ? (frequencies?.Offense || 0) + (frequencies?.Misbehavior || 0)
                                                        : (frequencies?.Offense || 0) + (frequencies?.Misbehavior || 0));

                                                return (
                                                    <tr key={grade}>
                                                        {selectedGrade && selectedSection ? null : <td>Grade - {grade}</td>}
                                                        <td>{frequencies?.Absent || 0}</td>
                                                        <td>{frequencies?.Tardy || 0}</td>
                                                        <td>{frequencies?.['Cutting Classes'] || 0}</td>
                                                        <td>{frequencies?.['Improper Uniform'] || 0}</td>
                                                        {loggedInUser && loggedInUser.userType !== 2 && (
                                                            <>
                                                                <td>{frequencies?.Offense || 0}</td>
                                                                <td>{frequencies?.Misbehavior || 0}</td>
                                                            </>
                                                        )}
                                                        {loggedInUser && loggedInUser.userType === 2 && (
                                                            <td>{(frequencies?.Offense || 0) + (frequencies?.Misbehavior || 0)}</td>
                                                        )}
                                                        <td>{frequencies?.Clinic || 0}</td>
                                                        <td>{frequencies?.['Request Permit'] || 0}</td>
                                                        <td>{frequencies?.Sanction || 0}</td>
                                                        <td style={{ borderLeft: '2px solid #8A252C', fontWeight: 'bold', backgroundColor: '#eee' }}>
                                                            <b>{rowTotal}</b>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Total row for all columns */}
                                            {!selectedGrade && !selectedSection && (
                                                <tr style={{ borderTop: '2px solid #8A252C', fontWeight: 'bold', backgroundColor: '#eee' }}>
                                                    <td>Total</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Absent || 0), 0)}</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Tardy || 0), 0)}</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.['Cutting Classes'] || 0), 0)}</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.['Improper Uniform'] || 0), 0)}</td>
                                                    {loggedInUser && loggedInUser.userType !== 2 && (
                                                        <>
                                                            <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Offense || 0), 0)}</td>
                                                            <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Misbehavior || 0), 0)}</td>
                                                        </>
                                                    )}
                                                    {loggedInUser && loggedInUser.userType === 2 && (
                                                        <td>
                                                            {Object.values(filteredFrequencyData).reduce(
                                                                (sum, f) => sum + (f?.Offense || 0) + (f?.Misbehavior || 0),
                                                                0
                                                            )}
                                                        </td>
                                                    )}
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Clinic || 0), 0)}</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.['Request Permit'] || 0), 0)}</td>
                                                    <td>{Object.values(filteredFrequencyData).reduce((sum, f) => sum + (f?.Sanction || 0), 0)}</td>
                                                    <td style={{ borderLeft: '2px solid #8A252C', backgroundColor: '#ddd'}}>
                                                        {Object.values(filteredFrequencyData).reduce((sum, f) => {
                                                            const rowTotal =
                                                                (f?.Absent || 0) +
                                                                (f?.Tardy || 0) +
                                                                (f?.['Cutting Classes'] || 0) +
                                                                (f?.['Improper Uniform'] || 0) +
                                                                (f?.Clinic || 0) +
                                                                (f?.['Request Permit'] || 0) +
                                                                (f?.Sanction || 0) +
                                                                (loggedInUser && loggedInUser.userType !== 2
                                                                    ? (f?.Offense || 0) + (f?.Misbehavior || 0)
                                                                    : (f?.Offense || 0) + (f?.Misbehavior || 0));
                                                            return sum + rowTotal;
                                                        }, 0)}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>

                    {selectedSection && (
                        <>
                            {/* New Table for Students */}
                            <h2 className={styles.RecordTitle}>Class Overview</h2>
                            <div className={tableStyles['table-container']}>
                                <table className={tableStyles['global-table']}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '250px'}}>Name</th>
                                            <th>Absent</th>
                                            <th>Tardy</th>
                                            <th>Cutting Classes</th>
                                            <th>Improper Uniform</th>
                                            <th>Offense</th>
                                            <th>Misbehavior</th>
                                            <th>Clinic</th>
                                            <th>Request Permit</th>
                                            <th style={{borderRight: '0.5px solid #8A252C'}}>Sanction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedMonth && selectedSection ? <>{classOverviewTableByMonth}</> :<>{classOverviewTable}</>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    <h2 className={styles.RecordTitle}>Analytics Overview</h2>
                    <div className={styles.chartContainer}> {/* This will apply the centering styles */}
                        <div className={styles['linechart-Container']}>
                             {selectedChartType === 'line' && (
                                <Line
                                    data={getChartData()}
                                    options={{
                                        responsive: true,
                                        scales: { y: { beginAtZero: true } },
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: selectedMonth ? `Daily Frequencies in ${selectedMonth}` : 'Monthly Frequencies (Aug to May)' },
                                            datalabels: false, // Disable data labels
                                        },
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                            {selectedChartType === 'bar' && (
                                <Bar
                                    data={getChartData()}
                                    options={{
                                        responsive: true,
                                        scales: { y: { beginAtZero: true } },
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: selectedMonth ? `Daily Frequencies in ${selectedMonth}` : 'Monthly Frequencies (Aug to May)' },
                                            datalabels: false, // Disable data labels
                                        },
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                            <div className={styles['piechart-Container']}>
                                {selectedChartType === 'pie' && (
                                    <Pie
                                        data={getChartPieData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: { display: true, text: 'Monitored Records Distribution' },
                                                datalabels: {
                                                    formatter: (value, context) => {
                                                        const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                                                        const percentage = ((value / total) * 100).toFixed(1);
                                                        return `${percentage}%`; // Display percentage
                                                    },
                                                    color: '#fff',
                                                    textStrokeColor: '#000', // Simulate shadow effect
                                                    textStrokeWidth: 2,
                                                    font: {
                                                        weight: 'bold',
                                                    },
                                                    anchor: 'end', // Position the label outside the pie slice
                                                    align: 'start',  // Align the label with the edge of the chart
                                                },
                                            },
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Loader Overlay */}
            {loading && <Loader />}
        </div>
    );
};

export default Record;
