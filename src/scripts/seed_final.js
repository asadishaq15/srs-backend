
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URL = 'mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs';

const parentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});
const Parent = mongoose.model("Parent", parentSchema);

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  class: String,
  section: String,
  gender: String,
  dob: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  emergencyContact: String,
  enrollDate: String,
  expectedGraduation: String,
  password: String,
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }],
  profilePhoto: String,
  transcripts: [String],
  reportCards: [String],
  iipFlag: Boolean,
  honorRolls: Boolean,
  athletics: Boolean,
  clubs: String,
  lunch: String,
  nationality: String,
});
const Student = mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  assignedCourses: [String],
  address: String,
  qualification: String,
});
const Teacher = mongoose.model("Teacher", teacherSchema);

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, unique: true },
  courseName: String,
  description: String,
  courseCredit: Number,
  departmentId: String,
  assigned: Boolean,
});
const Course = mongoose.model("Course", courseSchema);

const scheduleDaySchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  date: String,
});
const scheduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  className: String,
  section: String,
  note: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  dayOfWeek: [scheduleDaySchema],
});
const Schedule = mongoose.model("Schedule", scheduleSchema);

const attendanceSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  date: String,
  class: String,
  section: String,
  students: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      studentId: String,
      studentName: String,
      attendance: String,
      note: String,
      checkInTime: String,
      checkOutTime: String,
      reason: String,
    },
  ],
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

const gradeComponentSchema = new mongoose.Schema({
  score: Number,
  weightage: Number,
});
const gradeSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  class: String,
  section: String,
  term: String,
  quiz: gradeComponentSchema,
  midTerm: gradeComponentSchema,
  project: gradeComponentSchema,
  finalTerm: gradeComponentSchema,
  overAll: Number,
}, { timestamps: true });
const Grade = mongoose.model("Grade", gradeSchema);

const activitySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  performBy: String,
  createdAt: { type: Date, default: Date.now },
});
const Activity = mongoose.model("Activity", activitySchema);

const absenceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  date: Date,
  type: String,
  reason: String,
  status: String,
  startTime: String,
  endTime: String,
  documentName: String,
  documentUrl: String,
  submittedAt: Date,
});
const Absence = mongoose.model("Absence", absenceSchema);

// -------- DOCUMENTS & FORMS --------
const studentDocumentSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['form', 'permission', 'report', 'letter'] },
  category: { type: String, enum: ['academic', 'administrative', 'extracurricular', 'health'] },
  description: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  status: { type: String, enum: ['pending', 'completed', 'expired', 'available'], default: 'pending' },
  date: String,
  dueDate: String,
  required: Boolean,
  fileUrl: String,
  uploadUrl: String,
  comment: String,
  uploadedAt: Date,
}, { timestamps: true });
const StudentDocument = mongoose.model("StudentDocument", studentDocumentSchema);

// -------- BEHAVIOR --------
const behaviorSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  type: { type: String, enum: ["positive", "negative", "neutral"], required: true },
  title: String,
  description: String,
  date: String,
  location: String,
  action: String,
  status: { type: String, enum: ["resolved", "pending", "ongoing"], default: "pending" }
}, { timestamps: true });
const Behavior = mongoose.model("Behavior", behaviorSchema);

// ----------- MAIN SEED FUNCTION -------------
async function seed() {
  await mongoose.connect(MONGODB_URL);

  // Clean up for demo
  await Promise.all([
    Parent.deleteMany({ email: /@demo\.com/ }),
    Student.deleteMany({ email: /@childdemo\.com/ }),
    Teacher.deleteMany({ email: /@teacherdemo\.com/ }),
    Course.deleteMany({}),
    Schedule.deleteMany({}),
    Attendance.deleteMany({}),
    Grade.deleteMany({}),
    Activity.deleteMany({}),
    Absence.deleteMany({}),
    StudentDocument.deleteMany({}),
    Behavior.deleteMany({}),
  ]);

  // --- 1. Teachers
  const [teacher1, teacher2, teacher3] = await Teacher.insertMany([
    {
      firstName: "Adeel", lastName: "Farooq", gender: "Male", phone: "03010101010",
      email: "adeel.farooq@teacherdemo.com", password: await bcrypt.hash("tpass1", 10),
      department: "Mathematics", assignedCourses: [], address: "Maple Teacher St, Lahore", qualification: "MSc Mathematics"
    },
    {
      firstName: "Saba", lastName: "Qureshi", gender: "Female", phone: "03020202020",
      email: "saba.qureshi@teacherdemo.com", password: await bcrypt.hash("tpass2", 10),
      department: "Science", assignedCourses: [], address: "Oak Teacher Rd, Karachi", qualification: "MSc Chemistry"
    },
    {
      firstName: "Murtaza", lastName: "Ali", gender: "Male", phone: "03030303030",
      email: "murtaza.ali@teacherdemo.com", password: await bcrypt.hash("tpass3", 10),
      department: "English", assignedCourses: [], address: "Pine Teacher Ave, Islamabad", qualification: "MA English"
    },
  ]);

  // --- 2. Courses
  const [math, science, english] = await Course.insertMany([
    { courseCode: "MTH-201", courseName: "Intermediate Math", description: "Core mathematics, algebra and geometry.", courseCredit: 3, departmentId: "Mathematics", assigned: true },
    { courseCode: "SCI-301", courseName: "General Science", description: "Integrated science: biology, chemistry, physics.", courseCredit: 3, departmentId: "Science", assigned: true },
    { courseCode: "ENG-101", courseName: "English Language", description: "Reading, composition, speaking.", courseCredit: 3, departmentId: "English", assigned: true },
  ]);

  // --- 3. Parent (updated email)
  const parent = await Parent.create({
    firstName: "Daniyal",
    lastName: "Qamar",
    email: "daniyalqamar156@demo.com", // Updated xqemail
    password: await bcrypt.hash("parent123", 10),
    phone: "03451112222",
    address: "99 New Parent Town, Lahore",
    children: [],
  });

  // --- 4. Students (5 children with new names and emails)
  const today = new Date();
  function dateStr(daysAgo) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  }
  function gradDate(enroll) {
    const d = new Date(enroll);
    d.setFullYear(d.getFullYear() + 5);
    return d.toISOString().split("T")[0];
  }
  const childrenData = [
    {
      studentId: "DQ-2101",
      firstName: "Aamir",
      lastName: "Daniyal",
      class: "6",
      section: "A",
      gender: "Male",
      dob: "2012-04-10",
      email: "aamir@childdemo.com",
      phone: "03331110000",
      address: "99 New Parent Town, Lahore",
      emergencyContact: "03210000000",
      enrollDate: "2022-09-01",
      expectedGraduation: gradDate("2022-09-01"),
      password: await bcrypt.hash("studpass1", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/men/60.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: false,
      honorRolls: true,
      athletics: true,
      clubs: "Football",
      lunch: "Veg",
      nationality: "Pakistani",
    },
    {
      studentId: "DQ-2102",
      firstName: "Nadia",
      lastName: "Daniyal",
      class: "3",
      section: "B",
      gender: "Female",
      dob: "2015-06-22",
      email: "nadia@childdemo.com",
      phone: "03332220000",
      address: "99 New Parent Town, Lahore",
      emergencyContact: "03212220000",
      enrollDate: "2023-04-10",
      expectedGraduation: gradDate("2023-04-10"),
      password: await bcrypt.hash("studpass2", 10),
      parents: [parent._id],
      profilePhoto: "https://thumbs.dreamstime.com/b/girl-teenager-teen-female-young-african-american-woman-outside-smiling-perfect-teeth-mixed-race-biracial-wearing-green-t-192716472.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: false,
      honorRolls: false,
      athletics: false,
      clubs: "Science",
      lunch: "Egg",
      nationality: "Pakistani",
    },
    {
      studentId: "DQ-2103",
      firstName: "Imran",
      lastName: "Daniyal",
      class: "9",
      section: "C",
      gender: "Male",
      dob: "2009-11-05",
      email: "imran@childdemo.com",
      phone: "03333330000",
      address: "99 New Parent Town, Lahore",
      emergencyContact: "03213330000",
      enrollDate: "2019-08-15",
      expectedGraduation: gradDate("2019-08-15"),
      password: await bcrypt.hash("studpass3", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/men/62.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: true,
      honorRolls: false,
      athletics: true,
      clubs: "Drama",
      lunch: "Chicken",
      nationality: "Pakistani",
    },
    {
      studentId: "DQ-2104",
      firstName: "Sana",
      lastName: "Daniyal",
      class: "8",
      section: "D",
      gender: "Female",
      dob: "2010-09-18",
      email: "sana@childdemo.com",
      phone: "03334440000",
      address: "99 New Parent Town, Lahore",
      emergencyContact: "03214440000",
      enrollDate: "2020-01-10",
      expectedGraduation: gradDate("2020-01-10"),
      password: await bcrypt.hash("studpass4", 10),
      parents: [parent._id],
      profilePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv31o1PtXoC7oaPHgxJAp8zSkjYBu7rsuHrQ&s",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: false,
      honorRolls: true,
      athletics: false,
      clubs: "Music",
      lunch: "Fish",
      nationality: "Pakistani",
    },
    {
      studentId: "DQ-2105",
      firstName: "Kamran",
      lastName: "Daniyal",
      class: "5",
      section: "E",
      gender: "Male",
      dob: "2013-12-30",
      email: "kamran@childdemo.com",
      phone: "03335550000",
      address: "99 New Parent Town, Lahore",
      emergencyContact: "03215550000",
      enrollDate: "2021-03-20",
      expectedGraduation: gradDate("2021-03-20"),
      password: await bcrypt.hash("studpass5", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/men/65.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: false,
      honorRolls: false,
      athletics: true,
      clubs: "Art",
      lunch: "Beef",
      nationality: "Pakistani",
    },
  ];

  const [child1, child2, child3, child4, child5] = await Student.insertMany(childrenData);

  parent.children = [child1._id, child2._id, child3._id, child4._id, child5._id];
  await parent.save();

  // 6. Schedule, Attendance, Grades, Activities, Absence
  // Schedules
  const schedules = [
    {
      courseId: math._id,
      className: "6",
      section: "A",
      note: "Bring calculator",
      teacherId: teacher1._id,
      dayOfWeek: [
        { startTime: "08:00", endTime: "09:00", date: "Monday" },
        { startTime: "08:00", endTime: "09:00", date: "Wednesday" },
      ],
    },
    {
      courseId: science._id,
      className: "6",
      section: "A",
      note: "Lab work",
      teacherId: teacher2._id,
      dayOfWeek: [
        { startTime: "09:00", endTime: "10:00", date: "Tuesday" },
        { startTime: "09:00", endTime: "10:00", date: "Thursday" },
      ],
    },
    {
      courseId: english._id,
      className: "6",
      section: "A",
      note: "Bring novel",
      teacherId: teacher3._id,
      dayOfWeek: [
        { startTime: "10:00", endTime: "11:00", date: "Monday" },
        { startTime: "10:00", endTime: "11:00", date: "Friday" },
      ],
    },
  ];
  await Schedule.insertMany(schedules);

  // Attendance
  const attendances = [
    {
      teacherId: teacher1._id,
      courseId: math._id,
      date: dateStr(0),
      class: "6",
      section: "A",
      students: [
        {
          _id: child1._id,
          studentId: child1.studentId,
          studentName: `${child1.firstName} ${child1.lastName}`,
          attendance: "present",
          note: "",
          checkInTime: "08:00",
          checkOutTime: "09:00",
          reason: "",
        },
      ],
    },
    {
      teacherId: teacher2._id,
      courseId: science._id,
      date: dateStr(1),
      class: "6",
      section: "A",
      students: [
        {
          _id: child1._id,
          studentId: child1.studentId,
          studentName: `${child1.firstName} ${child1.lastName}`,
          attendance: "absent",
          note: "Medical leave",
          checkInTime: "",
          checkOutTime: "",
          reason: "Medical",
        },
      ],
    },
  ];
  await Attendance.insertMany(attendances);

  // Grades
  const grades = [
    {
      teacherId: teacher1._id,
      courseId: math._id,
      studentId: child1._id,
      class: "6",
      section: "A",
      term: "Spring 2025",
      quiz: { score: 85, weightage: 20 },
      midTerm: { score: 78, weightage: 30 },
      project: { score: 92, weightage: 20 },
      finalTerm: { score: 88, weightage: 30 },
      overAll: 85.5,
    },
    {
      teacherId: teacher2._id,
      courseId: science._id,
      studentId: child1._id,
      class: "6",
      section: "A",
      term: "Spring 2025",
      quiz: { score: 90, weightage: 20 },
      midTerm: { score: 82, weightage: 30 },
      project: { score: 95, weightage: 20 },
      finalTerm: { score: 89, weightage: 30 },
      overAll: 88.7,
    },
  ];
  await Grade.insertMany(grades);

  // Activities
  const activities = [
    {
      title: "Login Activity",
      subtitle: "Parent logged in",
      performBy: "Daniyal Qamar",
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      title: "Form Submitted",
      subtitle: "Medical form submitted for Aamir",
      performBy: "Daniyal Qamar",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      title: "Grade Published",
      subtitle: "Math Spring 2025 grades released",
      performBy: "Adeel Farooq",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  ];
  await Activity.insertMany(activities);

  // Absence Requests
  const absences = [
    {
      student: child1._id,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      type: "Full Day",
      reason: "Doctor's appointment",
      status: "Pending",
      startTime: "",
      endTime: "",
      documentName: "Doctor's note.pdf",
      documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      submittedAt: new Date(),
    },
    {
      student: child3._id,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      type: "Half Day",
      reason: "Family event",
      status: "Approved",
      startTime: "12:00",
      endTime: "15:00",
      documentName: "",
      documentUrl: "",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  ];
  await Absence.insertMany(absences);

  // 11. BEHAVIOR logs
  const students = [child1, child2, child3, child4, child5];
  const teachers = [teacher1, teacher2, teacher3];
  function pickTeacher(i) { return teachers[i % teachers.length]; }
  function todayMinus(n=0) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }
  const demoIncidents = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i)?._id,
      type: "positive",
      title: "Helped a New Student",
      description: `${s.firstName} assisted a new student in class. Displayed excellent leadership.`,
      date: todayMinus(1+i),
      location: "Classroom",
      action: "",
      status: "resolved"
    });
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+1)?._id,
      type: "negative",
      title: "Disruptive in Class",
      description: `${s.firstName} was talking during the lesson and distracted others.`,
      date: todayMinus(3+i),
      location: "Math Room",
      action: "Verbal warning",
      status: "pending"
    });
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+2)?._id,
      type: "neutral",
      title: "Tardy",
      description: `${s.firstName} arrived late to class.`,
      date: todayMinus(2+i),
      location: "Science Lab",
      action: "",
      status: "resolved"
    });
    demoIncidents.push({
      studentId: s._id,
      teacherId: pickTeacher(i+3)?._id,
      type: "negative",
      title: "Assignment Not Submitted",
      description: `${s.firstName} did not submit homework on time.`,
      date: todayMinus(5+i),
      location: "English Room",
      action: "Parent notified",
      status: "resolved"
    });
  }
  await Behavior.insertMany(demoIncidents);

  // 12. DOCUMENTS & FORMS -- For each child, assign 3 demo docs/forms
  const docTemplates = [
    {
      title: "Permission Slip: Field Trip",
      type: "permission",
      category: "extracurricular",
      description: "Sign and return for upcoming field trip.",
      status: "pending",
      dueDate: dateStr(-3),
      required: true,
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      title: "Medical Form",
      type: "form",
      category: "health",
      description: "Submit updated health information.",
      status: "pending",
      dueDate: dateStr(-7),
      required: true,
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      title: "Report Card: Spring 2024",
      type: "report",
      category: "academic",
      description: "Spring 2024 report card available for download.",
      status: "available",
      dueDate: dateStr(-1),
      required: false,
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      title: "Welcome Letter",
      type: "letter",
      category: "administrative",
      description: "Welcome to the new academic year!",
      status: "completed",
      dueDate: dateStr(-10),
      required: false,
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      comment: "Thank you, received.",
      uploadedAt: new Date(),
    },
  ];
  const documentInserts = [];
  for (const child of [child1, child2, child3, child4, child5]) {
    for (const docTpl of docTemplates) {
      documentInserts.push({
        ...docTpl,
        studentId: child._id,
        date: dateStr(-7),
      });
    }
  }
  await StudentDocument.insertMany(documentInserts);

  console.log("✅ Parent/Student demo data seeded with 5 children and parent Daniyal Qamar, including documents/forms!");
  await mongoose.disconnect();
}

seed();