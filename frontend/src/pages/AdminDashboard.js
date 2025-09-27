import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes, teachersRes] = await Promise.all([
          axios.get('/api/teacher/courses', { headers: { 'x-auth-token': token } }),
          axios.get('/api/admin/students', { headers: { 'x-auth-token': token } }),
          axios.get('/api/admin/teachers', { headers: { 'x-auth-token': token } }),
        ]);
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
        setTeachers(teachersRes.data);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/courses',
        { name: courseName, teacherId: selectedTeacher },
        { headers: { 'x-auth-token': token } }
      );
      setCourseName('');
      setSelectedTeacher('');
      // Refresh courses list
      const coursesRes = await axios.get('/api/teacher/courses', { headers: { 'x-auth-token': token } });
      setCourses(coursesRes.data);
    } catch (err) {
      setError('Failed to create course');
      console.error(err);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin/courses/${selectedCourse}/enroll`,
        { studentId: selectedStudent },
        { headers: { 'x-auth-token': token } }
      );
      setSelectedCourse('');
      setSelectedStudent('');
    } catch (err) {
      setError('Failed to enroll student');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h3>Create Course</h3>
        <form onSubmit={handleCreateCourse}>
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} required>
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.username}</option>)}
          </select>
          <button type="submit">Create Course</button>
        </form>
      </section>

      <section>
        <h3>Enroll Student</h3>
        <form onSubmit={handleEnrollStudent}>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
          </select>
          <button type="submit">Enroll Student</button>
        </form>
      </section>

      <section>
        <h3>All Teachers</h3>
        <ul>
          {teachers.map(t => <li key={t._id}>{t.username} ({t.email})</li>)}
        </ul>
      </section>

      <section>
        <h3>All Students</h3>
        <ul>
          {students.map(s => <li key={s._id}>{s.username} ({s.email})</li>)}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;