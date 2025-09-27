import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUserRole(payload.user.role);
      } catch (e) {
        console.error('Failed to decode token', e);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setUserRole(payload.user.role);
        localStorage.setItem('token', newToken);
      } catch (e) {
        console.error('Failed to decode token', e);
        localStorage.removeItem('token');
      }
    } else {
      setUserRole(null);
      localStorage.removeItem('token');
    }
  };

  const handleLogout = () => {
    handleSetToken(null);
  };

  const getHomeComponent = () => {
    switch (userRole) {
      case 'student':
        return <StudentDashboard token={token} />;
      case 'teacher':
        return <TeacherDashboard token={token} />;
      case 'admin':
        return <AdminDashboard token={token} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>School Attendance System</h1>
          {token && <button onClick={handleLogout}>Logout</button>}
        </header>
        <main>
          <Routes>
            <Route
              path="/login"
              element={!token ? <LoginPage setToken={handleSetToken} /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={token ? getHomeComponent() : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;