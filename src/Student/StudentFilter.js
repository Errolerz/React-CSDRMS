import React, { useEffect, useState } from 'react';
import styles from './Student.module.css'; // Importing CSS module
import axios from 'axios';

const StudentFilter = ({
  schoolYears,
  loggedInUser,
  selectedSchoolYear,
  setSelectedSchoolYear,
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek,
  setSelectedMonitoredRecord,
  selectedMonitoredRecord,
  grades,

  chartType, // New prop for chart type
  setChartType, // New prop to set chart type
  showGradeAndSection = true, // Existing prop to control grade and section visibility
  isAnalytics = false, // New prop to control chart type dropdown visibility
}) => {
  const [sections, setSections] = useState([]);

  const months = [
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
  ];

  const weeks = [
    { value: '1', label: 'Week 1' },
    { value: '2', label: 'Week 2' },
    { value: '3', label: 'Week 3' },
    { value: '4', label: 'Week 4' },
    { value: '5', label: 'Week 5' },
  ];

  const monitored_record = [
    { value: 'Absent', label: 'Absent' },
    { value: 'Tardy', label: 'Tardy' },
    { value: 'Cutting Classes', label: 'Cutting Classes' },
    { value: 'Improper Uniform', label: 'Improper Uniform' },
    { value: 'Offense', label: 'Offense' },
    { value: 'Misbehavior', label: 'Misbehavior' },
    { value: 'Clinic', label: 'Clinic' },
    
  ];

  const fetchSectionsByGrade = async (grade) => {
    try {
      const response = await axios.get(`https://spring-csdrms-g8ra.onrender.com/class/sections/${grade}`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    if (selectedGrade) {
      fetchSectionsByGrade(selectedGrade);
    } else {
      setSections([]); // Reset sections if no grade is selected
    }
  }, [selectedGrade]);

  return (
    <div className={styles.filterContainer}>
      <label>Filters: 
        <select
          value={selectedMonitoredRecord}
          onChange={(e) => setSelectedMonitoredRecord(e.target.value)}
        >
          <option value="">All Monitored Records</option>
          {monitored_record.map((monitored_record) => (
            <option key={monitored_record.value} value={monitored_record.value}>
              {monitored_record.label}
            </option>
          ))}
        </select>
        
        {loggedInUser?.userType !== 3 && (
          <select
            value={selectedSchoolYear}
            onChange={(e) => setSelectedSchoolYear(e.target.value)}
          >
            <option value="">All School Years</option>
            {schoolYears.map((schoolYear) => (
              <option key={schoolYear.schoolYear_ID} value={schoolYear.schoolYear}>
                {schoolYear.schoolYear}
              </option>
            ))}
          </select>
        )}

        {showGradeAndSection && (
          <>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection(''); // Reset section when grade changes
                fetchSectionsByGrade(e.target.value); // Fetch sections for selected grade
              }}
              disabled={loggedInUser?.userType === 3}
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            {selectedGrade && (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={loggedInUser?.userType === 3}
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          <option value="">All Weeks</option>
          {weeks.map((week) => (
            <option key={week.value} value={week.value}>
              {week.label}
            </option>
          ))}
        </select>
        


        {/* Conditional rendering for the chart type dropdown */}
        {isAnalytics && (
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        )}
      </label>
    </div>
  );
};

export default StudentFilter;
