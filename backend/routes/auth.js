const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Admin = require('../models/admin.model');

// Student Registration
router.post('/register/student', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ msg: 'Student already exists' });
    }

    // Create new student
    student = new Student({ username, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();

    // Create and return token
    const payload = { user: { id: student.id, role: 'student' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher Registration
router.post('/register/teacher', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ msg: 'Teacher already exists' });
    }
    teacher = new Teacher({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);
    await teacher.save();
    const payload = { user: { id: teacher.id, role: 'teacher' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin Registration
router.post('/register/admin', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }
      admin = new Admin({ username, email, password });
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
      await admin.save();
      const payload = { user: { id: admin.id, role: 'admin' } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check across all user types
    let user = await Student.findOne({ email }) || await Teacher.findOne({ email }) || await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const role = user.constructor.modelName.toLowerCase();
    const payload = { user: { id: user.id, role: role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;