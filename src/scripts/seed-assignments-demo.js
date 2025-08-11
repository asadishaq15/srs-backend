// seed-assignments-demo.js
const mongoose = require('mongoose');

const MONGODB_URL = 'mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs';

const assignmentSchema = new mongoose.Schema({
  title: String,
  subject: String,
  type: String,
  description: String,
  assignedDate: String,
  dueDate: String,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  studentStatuses: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: { type: String, enum: ["upcoming", "completed", "overdue", "graded"], default: "upcoming" },
      grade: {
        score: Number,
        outOf: Number,
        feedback: String,
      },
      submittedAt: String,
    }
  ],
}, { timestamps: true });
const Assignment = mongoose.model("Assignment", assignmentSchema);

const studentSchema = new mongoose.Schema({ email: String, firstName: String, lastName: String, class: String, section: String });
const Student = mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema({ email: String });
const Teacher = mongoose.model("Teacher", teacherSchema);

async function seedAssignments() {
  await mongoose.connect(MONGODB_URL);

  // 1. Find the 5 students by their emails
  const students = await Student.find({ email: { $in: [
    "ali@childdemo.com",
    "sara@childdemo.com",
    "hassan@childdemo.com",
    "alina@childdemo.com",
    "zain@childdemo.com"
  ] } });
  if (students.length !== 5) throw new Error("Not all students found!");

  // 2. Find 3 demo teachers (by email)
  const teachers = await Teacher.find({ email: { $in: [
    "adeel.farooq@teacherdemo.com",
    "saba.qureshi@teacherdemo.com",
    "murtaza.ali@teacherdemo.com"
  ] } });
  if (teachers.length !== 3) throw new Error("Teachers not found!");

  // 3. Assignment templates
  const today = new Date();
  function addDays(dt, n) { const d = new Date(dt); d.setDate(d.getDate() + n); return d; }
  function isoDate(dt) { return (new Date(dt)).toISOString(); }

  // Remove previous seed (optional: only for demo repeatability)
  await Assignment.deleteMany({ title: /Demo (Homework|Quiz|Project|Test)/ });

  // 4. For each student, create a set of assignments
  const allAssignments = [];

  for (const [i, student] of students.entries()) {
    // Assign a teacher based on student index
    const teacher = teachers[i % teachers.length];

    // 1 Homework (Upcoming)
    allAssignments.push({
      title: `Demo Homework #${i+1}`,
      subject: "Mathematics",
      type: "homework",
      description: `Complete the exercises from page ${10+i}-14. Show all steps.`,
      assignedDate: isoDate(addDays(today, -2)),
      dueDate: isoDate(addDays(today, 5)),
      assignedBy: teacher._id,
      students: [student._id],
      studentStatuses: [{
        student: student._id,
        status: "upcoming"
      }]
    });

    // 1 Project (Completed)
    allAssignments.push({
      title: `Demo Project #${i+1}`,
      subject: "Science",
      type: "project",
      description: `Build a simple working model for the Science Fair.`,
      assignedDate: isoDate(addDays(today, -14)),
      dueDate: isoDate(addDays(today, -7)),
      assignedBy: teacher._id,
      students: [student._id],
      studentStatuses: [{
        student: student._id,
        status: "completed",
        submittedAt: isoDate(addDays(today, -8))
      }]
    });

    // 1 Quiz (Graded)
    allAssignments.push({
      title: `Demo Quiz #${i+1}`,
      subject: "English",
      type: "quiz",
      description: "Grammar and comprehension quiz. 10 questions.",
      assignedDate: isoDate(addDays(today, -10)),
      dueDate: isoDate(addDays(today, -9)),
      assignedBy: teacher._id,
      students: [student._id],
      studentStatuses: [{
        student: student._id,
        status: "graded",
        grade: {
          score: 8 + i,
          outOf: 10,
          feedback: `Good job! Missed only ${2-i} question(s).`
        },
        submittedAt: isoDate(addDays(today, -9))
      }]
    });

    // 1 Test (Overdue)
    allAssignments.push({
      title: `Demo Test #${i+1}`,
      subject: "Mathematics",
      type: "test",
      description: "Unit test on Algebra and Geometry.",
      assignedDate: isoDate(addDays(today, -4)),
      dueDate: isoDate(addDays(today, -1)),
      assignedBy: teacher._id,
      students: [student._id],
      studentStatuses: [{
        student: student._id,
        status: "overdue"
      }]
    });
  }

  // 5. Bulk insert
  await Assignment.insertMany(allAssignments);

  console.log(`✅ Seeded ${allAssignments.length} assignments for 5 children!`);
  await mongoose.disconnect();
}

seedAssignments().catch(err => { console.error(err); process.exit(1); });