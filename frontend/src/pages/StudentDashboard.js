import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDashboard = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/student/courses', {
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

  const fetchAttendance = async (courseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/student/attendance/${courseId}`, {
        headers: { 'x-auth-token': token },
      });
      setAttendance((prev) => ({ ...prev, [courseId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch attendance for course', courseId, err);
    }
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>Your Courses</h3>
        {courses.length === 0 ? (
          <p>You are not enrolled in any courses.</p>
        ) : (
          courses.map((course) => (
            <div key={course._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h4>{course.name}</h4>
              <p>Teacher: {course.teacher.username}</p>
              <button onClick={() => fetchAttendance(course._id)}>View Attendance</button>
              {attendance[course._id] && (
                <ul>
                  {attendance[course._id].length > 0 ? (
                    attendance[course._id].map((record) => (
                      <li key={record._id}>
                        {new Date(record.date).toLocaleDateString()}: {record.status}
                      </li>
                    ))
                  ) : (
                    <p>No attendance records found for this course.</p>
                  )}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;