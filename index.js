const express = require('express');
const app = express();
const cors = require('cors');
const xlsx = require('xlsx');

app.use(express.json());
app.use(cors());

// Importing students from the separate file
const workbook = xlsx.readFile('data/full_student_dataset.xlsx');
const sheetName = workbook.SheetNames[0];
let students = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
console.log(students);

// 1. Login User API - Changed to GET
app.get('/login-user', (req, res) => {
  const { id, password } = req.query;

  // Check for student with the given ID and password
  const student = students.find(s => s['Student ID'] === id);
  
  // If password column exists, check it. Otherwise, check the Name column.
  if (student) {
    const studentPassword = student.password || student.Name; // Use 'Name' as password if no 'password' column exists
    if (studentPassword === password) {
      res.json({ message: 'Login successful', studentId: student['Student ID'] });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } else {
    res.status(401).json({ message: 'Invalid ID or password' });
  }
});

// 2. Get Student Details API - Changed to GET
app.get('/getStudentDetails/:id', (req, res) => {
  const studentId = req.params.id;
  const student = students.find(s => s['Student ID'] === studentId);

  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// 3. Change Password API - Changed to GET (with query parameters)
app.get('/changePasswordForUser', (req, res) => {
  const { id, oldPassword, newPassword } = req.query;
  const student = students.find(s => s['Student ID'] === id);

  if (student) {
    const studentPassword = student.password || student.Name; // Default to Name if no password column

    if (studentPassword === oldPassword) {
      // Update password
      student.password = newPassword;

      // Update the Excel file
      const updatedSheet = xlsx.utils.json_to_sheet(students);
      const updatedWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(updatedWorkbook, updatedSheet, sheetName);
      xlsx.writeFile(updatedWorkbook, 'data/full_student_dataset.xlsx');

      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Invalid old password' });
    }
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
