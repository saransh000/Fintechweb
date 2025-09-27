const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Course = require('../models/course.model');
const Attendance = require('../models/attendance.model');

// @route   GET /teacher/courses
// @desc    Get all courses for a teacher
// @access  Private (Teacher)
router.get('/courses', auth('teacher'), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id }).populate('students', 'username email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /teacher/attendance
// @desc    Take or update attendance for a student
// @access  Private (Teacher)
router.post('/attendance', auth('teacher'), async (req, res) => {
  const { courseId, studentId, date, status } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course || course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to manage this course' });
    }

    if (!course.students.includes(studentId)) {
      return res.status(400).json({ msg: 'Student not enrolled in this course' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOneAndUpdate(
      { course: courseId, student: studentId, date: { $gte: startOfDay, $lt: endOfDay } },
      { status, date: new Date(date) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /teacher/attendance/:courseId
// @desc    Get attendance for a specific course
// @access  Private (Teacher)
router.get('/attendance/:courseId', auth('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this course' });
    }

    const attendanceRecords = await Attendance.find({ course: req.params.courseId }).populate('student', 'username');
    res.json(attendanceRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;