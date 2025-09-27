const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const authRouter = require('./routes/auth');
const teacherRouter = require('./routes/teacher');
const studentRouter = require('./routes/student');
const adminRouter = require('./routes/admin');

app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/admin', adminRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});