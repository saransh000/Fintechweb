import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/teacher/courses', {
          headers: { 'x-auth-token': token },
        });
        setCourses(res.data);
      } catch (err) {
        setError('Failed to fetch courses');
        console.error(err);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchAttendance(course._id);
  };

  const fetchAttendance = async (courseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/teacher/attendance/${courseId}`, {
        headers: { 'x-auth-token': token },
      });
      const attendanceByStudent = res.data.reduce((acc, record) => {
        if (!acc[record.student._id]) {
          acc[record.student._id] = {};
        }
        const date = new Date(record.date).toISOString().split('T')[0];
        acc[record.student._id][date] = record.status;
        return acc;
      }, {});
      setAttendance(prev => ({ ...prev, [courseId]: attendanceByStudent }));
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  };

  const handleSetAttendance = async (courseId, studentId, status) => {
    const date = new Date().toISOString().split('T')[0];
    try {
      await axios.post('http://localhost:5000/teacher/attendance',
        { courseId, studentId, date, status },
        { headers: { 'x-auth-token': token } }
      );
      // Update local state
      setAttendance(prev => {
        const courseAttendance = prev[courseId] || {};
        const studentAttendance = courseAttendance[studentId] || {};
        studentAttendance[date] = status;
        return { ...prev, [courseId]: { ...courseAttendance, [studentId]: studentAttendance }};
      });
    } catch (err) {
      setError('Failed to set attendance');
      console.error(err);
    }
  };

  const getAttendanceStatus = (courseId, studentId) => {
    const date = new Date().toISOString().split('T')[0];
    return attendance[courseId]?.[studentId]?.[date] || 'Not Marked';
  };

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h3>Your Courses</h3>
        <ul>
          {courses.map(course => (
            <li key={course._id} onClick={() => handleSelectCourse(course)} style={{ cursor: 'pointer' }}>
              {course.name}
            </li>
          ))}
        </ul>
      </section>

      {selectedCourse && (
        <section>
          <h3>{selectedCourse.name} - Students</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Today's Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourse.students.map(student => (
                <tr key={student._id}>
                  <td>{student.username}</td>
                  <td>{student.email}</td>
                  <td>{getAttendanceStatus(selectedCourse._id, student._id)}</td>
                  <td>
                    <button onClick={() => handleSetAttendance(selectedCourse._id, student._id, 'present')}>Present</button>
                    <button onClick={() => handleSetAttendance(selectedCourse._id, student._id, 'absent')}>Absent</button>
                    <button onClick={() => handleSetAttendance(selectedCourse._id, student._id, 'late')}>Late</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default TeacherDashboard;