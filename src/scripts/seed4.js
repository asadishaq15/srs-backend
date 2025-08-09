// seed-parent-demo-updated.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

// --- 1. Setup ---
const MONGODB_URL = 'mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs';

// --- 2. Define Schemas (minimal, as in backend) ---
const guardianSchema = new mongoose.Schema({
  guardianName: String,
  guardianEmail: { type: String, unique: true },
  password: String,
  guardianPhone: String,
  guardianRelation: String,
  guardianProfession: String,
  guardianPhoto: { type: String, default: "N/A" },
});
const Guardian = mongoose.model("Guardian", guardianSchema);

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
  guardian: { type: mongoose.Schema.Types.ObjectId, ref: "Guardian" },
  profilePhoto: String,
  transcripts: [String],
  reportCards: [String],
});
const Student = mongoose.model("Student", studentSchema);

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

// --- 3. Seed Data ---
async function seed() {
  await mongoose.connect(MONGODB_URL);

  // Clean up (for demo)
  await Promise.all([
    Parent.deleteMany({ email: "asad.ali@example.com" }),
    Student.deleteMany({ email: /@child/ }),
    Guardian.deleteMany({ guardianEmail: /@guardian/ }),
    Teacher.deleteMany({}),
    Course.deleteMany({}),
    Schedule.deleteMany({}),
    Attendance.deleteMany({}),
    Grade.deleteMany({}),
    Activity.deleteMany({}),
    Absence.deleteMany({}),
  ]);

  // 1. Teachers
  const [teacher1, teacher2, teacher3] = await Teacher.insertMany([
    {
      firstName: "Bilal",
      lastName: "Khan",
      gender: "Male",
      phone: "03001234567",
      email: "bilal.khan@schooldemo.com",
      password: await bcrypt.hash("123", 10),
      department: "Mathematics",
      assignedCourses: [],
      address: "Maple Teacher Street, Lahore",
      qualification: "MSc Applied Mathematics",
    },
    {
      firstName: "Hina",
      lastName: "Noor",
      gender: "Female",
      phone: "03009876543",
      email: "hina.noor@schooldemo.com",
      password: await bcrypt.hash("123", 10),
      department: "Science",
      assignedCourses: [],
      address: "Oak Teacher Road, Karachi",
      qualification: "MSc Biology",
    },
    {
      firstName: "Omar",
      lastName: "Raza",
      gender: "Male",
      phone: "03007654321",
      email: "omar.raza@schooldemo.com",
      password: await bcrypt.hash("123", 10),
      department: "English",
      assignedCourses: [],
      address: "Pine Teacher Colony, Islamabad",
      qualification: "MA English Literature",
    },
  ]);

  // 2. Courses
  const [math, science, english] = await Course.insertMany([
    {
      courseCode: "MATH-102",
      courseName: "Mathematics II",
      description: "Intermediate Mathematics",
      courseCredit: 3,
      departmentId: "Mathematics",
      assigned: true,
    },
    {
      courseCode: "SCI-202",
      courseName: "Integrated Science",
      description: "General Science & Labs",
      courseCredit: 3,
      departmentId: "Science",
      assigned: true,
    },
    {
      courseCode: "ENG-302",
      courseName: "English Composition",
      description: "English Language & Literature",
      courseCredit: 3,
      departmentId: "English",
      assigned: true,
    },
  ]);

  // 3. Guardians (unique for each child)
  const [guardian1, guardian2, guardian3] = await Guardian.insertMany([
    {
      guardianName: "Sana Mir",
      guardianEmail: "sana1@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03230001111",
      guardianRelation: "Mother",
      guardianProfession: "Software Engineer",
      guardianPhoto: "N/A",
    },
    {
      guardianName: "Rashid Malik",
      guardianEmail: "rashid2@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03231112222",
      guardianRelation: "Father",
      guardianProfession: "Physician",
      guardianPhoto: "N/A",
    },
    {
      guardianName: "Mariam Qureshi",
      guardianEmail: "mariam3@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03232223333",
      guardianRelation: "Aunt",
      guardianProfession: "Teacher",
      guardianPhoto: "N/A",
    },
  ]);

  // 4. Students
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
  const [child1, child2, child3] = await Student.insertMany([
    {
      studentId: "AYD-2001",
      firstName: "Ayaan",
      lastName: "Mir",
      class: "6",
      section: "A",
      gender: "Male",
      dob: "2013-11-02",
      email: "ayaan@child.com",
      phone: "03330001111",
      address: "45 Parent Lane, Lahore",
      emergencyContact: "03001234567",
      enrollDate: "2020-09-01",
      expectedGraduation: gradDate("2020-09-01"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian1._id,
      profilePhoto: "https://i.pravatar.cc/150?img=12",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
    },
    {
      studentId: "MYA-2002",
      firstName: "Maya",
      lastName: "Malik",
      class: "3",
      section: "B",
      gender: "Female",
      dob: "2016-05-18",
      email: "maya@child.com",
      phone: "03331112222",
      address: "45 Parent Lane, Lahore",
      emergencyContact: "03007654321",
      enrollDate: "2022-08-20",
      expectedGraduation: gradDate("2022-08-20"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian2._id,
      profilePhoto: "https://i.pravatar.cc/150?img=22",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
    },
    {
      studentId: "LRA-2003",
      firstName: "Lara",
      lastName: "Qureshi",
      class: "9",
      section: "C",
      gender: "Female",
      dob: "2010-02-14",
      email: "lara@child.com",
      phone: "03332223333",
      address: "45 Parent Lane, Lahore",
      emergencyContact: "03009876543",
      enrollDate: "2018-08-10",
      expectedGraduation: gradDate("2018-08-10"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian3._id,
      profilePhoto: "https://i.pravatar.cc/150?img=32",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
    },
  ]);

  // 5. Parent
  const parent = await Parent.create({
    firstName: "Asad",
    lastName: "Ali",
    email: "asad.ali@example.com",
    password: await bcrypt.hash("123", 10),
    phone: "03451234567",
    address: "45 Parent Lane, Lahore",
    children: [child1._id, child2._id, child3._id],
  });

  // 6. Schedule (Mon-Fri, 1-2 periods per day, different courses)
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const schedules = [];
  for (const [child, childCourses, section, teacher] of [
    [child1, [math, science, english], "A", teacher1],
    [child2, [english, math, science], "B", teacher2],
    [child3, [science, english, math], "C", teacher3],
  ]) {
    for (let i = 0; i < weekDays.length; i++) {
      schedules.push({
        courseId: childCourses[i % childCourses.length]._id,
        className: child.class,
        section,
        note: "",
        teacherId: teacher._id,
        dayOfWeek: [
          {
            startTime: "08:00 AM",
            endTime: "09:30 AM",
            date: weekDays[i],
          },
        ],
      });
    }
  }
  await Schedule.insertMany(schedules);

  // 7. Attendance (for past 5 days, each child, each course)
  for (const child of [child1, child2, child3]) {
    for (let i = 0; i < 5; i++) {
      await Attendance.create({
        teacherId: teacher1._id,
        courseId: math._id,
        date: dateStr(i),
        class: child.class,
        section: child.section,
        students: [
          {
            _id: child._id,
            studentId: child.studentId,
            studentName: `${child.firstName} ${child.lastName}`,
            attendance: i === 1 ? "Absent" : i === 2 ? "Late" : "Present",
            checkInTime: "08:05 AM",
            checkOutTime: "01:00 PM",
            reason: i === 1 ? "Sick" : "",
          },
        ],
      });
    }
  }

  // 8. Grades (one for each student × each main course)
  const terms = ["Spring 2024", "Spring 2024", "Spring 2024"];
  const courseList = [math, science, english];
  const teacherList = [teacher1, teacher2, teacher3];

  // For each student, create a grade per course (with different marks)
  for (const [i, child] of [child1, child2, child3].entries()) {
    for (let j = 0; j < courseList.length; j++) {
      await Grade.create({
        teacherId: teacherList[j]._id,
        courseId: courseList[j]._id,
        studentId: child._id,
        class: child.class,
        section: child.section,
        term: terms[i],
        quiz: { score: 15 + i + j, weightage: 20 },
        midTerm: { score: 35 + i + j, weightage: 40 },
        project: { score: 18 + i + j, weightage: 20 },
        finalTerm: { score: 16 + i + j, weightage: 20 },
        overAll: 80 + 5 * i + 2 * j,
      });
    }
  }

  // 9. Activities (Announcements/Events)
  await Activity.insertMany([
    {
      title: "Orientation Day",
      subtitle: "Welcome new students on 1st Sept.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "Art & Science Exhibition",
      subtitle: "Inter-class exhibitions next month.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "School Closed for Holiday",
      subtitle: "School will remain closed on public holiday.",
      performBy: "Admin",
      createdAt: new Date(),
    },
  ]);

  // 10. Absence (for each child)
  for (const child of [child1, child2, child3]) {
    await Absence.create({
      student: child._id,
      date: new Date(dateStr(1)),
      type: "full",
      reason: "Medical leave",
      status: "approved",
      submittedAt: new Date(dateStr(1)),
    });
    await Absence.create({
      student: child._id,
      date: new Date(dateStr(3)),
      type: "partial",
      reason: "Family event",
      status: "pending",
      submittedAt: new Date(dateStr(3)),
    });
  }

  console.log("✅ Parent demo data seeded successfully!");
  await mongoose.disconnect();
}

seed();
