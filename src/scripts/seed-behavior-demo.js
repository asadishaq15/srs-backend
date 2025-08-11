// seed-behavior-demo.js

const mongoose = require('mongoose');

const MONGODB_URL = 'mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs';

// --- Models ---
const studentSchema = new mongoose.Schema({ email: String, firstName: String, lastName: String, class: String, section: String, profilePhoto: String });
const Student = mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema({ email: String, firstName: String, lastName: String, department: String });
const Teacher = mongoose.model("Teacher", teacherSchema);

const behaviorSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  type: { type: String, enum: ["positive", "negative", "neutral"], required: true },
  title: String,
  description: String,
  date: String, // ISO
  location: String,
  action: String,
  status: { type: String, enum: ["resolved", "pending", "ongoing"], default: "pending" }
}, { timestamps: true });
const Behavior = mongoose.model("Behavior", behaviorSchema);

async function seedBehavior() {
  await mongoose.connect(MONGODB_URL);

  // 1. Get demo students (by email, as per your parent seed)
  const students = await Student.find({ email: { $in: [
    "ali@childdemo.com",
    "sara@childdemo.com",
    "hassan@childdemo.com",
    "alina@childdemo.com",
    "zain@childdemo.com"
  ] } });
  if (students.length !== 5) throw new Error("Not all demo students found!");

  // 2. Get demo teachers (by email)
  const teachers = await Teacher.find({ email: { $in: [
    "adeel.farooq@teacherdemo.com",
    "saba.qureshhi@teacherdemo.com", // typo? or "qureshi"? (fix as per your database)
    "saba.qureshi@teacherdemo.com",
    "murtaza.ali@teacherdemo.com"
  ] } });
  if (!teachers.length) throw new Error("No teachers found!");

  // Helper for picking teacher & location
  function pickTeacher(i) {
    return teachers[i % teachers.length];
  }
  function today(n=0) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  // 3. Clean previous demo seed
  await Behavior.deleteMany({ title: /Demo Incident|Helped|Disruptive|Tardy|Assignment/i });

  // 4. Insert incidents per student
  const demoIncidents = [];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    // 1. Positive
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i)?._id,
      type: "positive",
      title: "Helped a New Student",
      description: `${s.firstName} assisted a new student in class. Displayed excellent leadership.`,
      date: today(1+i),
      location: "Classroom",
      action: "",
      status: "resolved"
    });
    // 2. Negative
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+1)?._id,
      type: "negative",
      title: "Disruptive in Class",
      description: `${s.firstName} was talking during the lesson and distracted others.`,
      date: today(3+i),
      location: "Math Room",
      action: "Verbal warning",
      status: "pending"
    });
    // 3. Neutral (Tardy)
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+2)?._id,
      type: "neutral",
      title: "Tardy",
      description: `${s.firstName} arrived late to class.`,
      date: today(2+i),
      location: "Science Lab",
      action: "",
      status: "resolved"
    });
    // 4. (Optional) Assignment incomplete
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+3)?._id,
      type: "negative",
      title: "Assignment Not Submitted",
      description: `${s.firstName} did not submit homework on time.`,
      date: today(5+i),
      location: "English Room",
      action: "Parent notified",
      status: "resolved"
    });
  }

  await Behavior.insertMany(demoIncidents);

  console.log(`✅ Seeded ${demoIncidents.length} behavior incidents for 5 children!`);
  await mongoose.disconnect();
}

seedBehavior().catch(e => { console.error(e); process.exit(1); });