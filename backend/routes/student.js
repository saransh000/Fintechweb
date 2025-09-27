const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Course = require('../models/course.model');
const Attendance = require('../models/attendance.model');

// @route   GET /student/courses
// @desc    Get all courses for a student
// @access  Private (Student)
router.get('/courses', auth('student'), async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id }).populate('teacher', 'username email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /student/attendance/:courseId
// @desc    Get attendance for a specific course
// @access  Private (Student)
router.get('/attendance/:courseId', auth('student'), async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course || !course.students.includes(req.user.id)) {
        return res.status(403).json({ msg: 'Not enrolled in this course' });
      }

      const attendanceRecords = await Attendance.find({ course: req.params.courseId, student: req.user.id });
      res.json(attendanceRecords);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;