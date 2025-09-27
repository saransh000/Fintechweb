const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Course = require('../models/course.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');

// @route   POST /admin/courses
// @desc    Create a new course
// @access  Private (Admin)
router.post('/courses', auth('admin'), async (req, res) => {
  const { name, teacherId } = req.body;
  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    const newCourse = new Course({
      name,
      teacher: teacherId,
    });

    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /admin/courses/:courseId/enroll
// @desc    Enroll a student in a course
// @access  Private (Admin)
router.post('/courses/:courseId/enroll', auth('admin'), async (req, res) => {
  const { studentId } = req.body;
  try {
    const course = await Course.findById(req.params.courseId);
    const student = await Student.findById(studentId);

    if (!course || !student) {
      return res.status(404).json({ msg: 'Course or Student not found' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ msg: 'Student already enrolled' });
    }

    course.students.push(studentId);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /admin/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', auth('admin'), async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /admin/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/teachers', auth('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.json(teachers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;