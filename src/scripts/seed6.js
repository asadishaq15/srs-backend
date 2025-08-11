// seed-parent-demo.js (for new parent-student schema)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// --- 1. Setup ---
const MONGODB_URL = 'mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs';

// --- 2. Define Schemas ---
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

// --- 3. Seed Data ---
async function seed() {
  await mongoose.connect(MONGODB_URL);

  // Clean up for demo (so you can run this script multiple times)
  await Promise.all([
    Parent.deleteMany({ email: /@parentdemo\.com/ }),
    Student.deleteMany({ email: /@childdemo\.com/ }),
    Teacher.deleteMany({ email: /@teacherdemo\.com/ }),
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
      firstName: "Adeel",
      lastName: "Farooq",
      gender: "Male",
      phone: "03010101010",
      email: "adeel.farooq@teacherdemo.com",
      password: await bcrypt.hash("tpass1", 10),
      department: "Mathematics",
      assignedCourses: [],
      address: "Maple Teacher St, Lahore",
      qualification: "MSc Mathematics",
    },
    {
      firstName: "Saba",
      lastName: "Qureshi",
      gender: "Female",
      phone: "03020202020",
      email: "saba.qureshi@teacherdemo.com",
      password: await bcrypt.hash("tpass2", 10),
      department: "Science",
      assignedCourses: [],
      address: "Oak Teacher Rd, Karachi",
      qualification: "MSc Chemistry",
    },
    {
      firstName: "Murtaza",
      lastName: "Ali",
      gender: "Male",
      phone: "03030303030",
      email: "murtaza.ali@teacherdemo.com",
      password: await bcrypt.hash("tpass3", 10),
      department: "English",
      assignedCourses: [],
      address: "Pine Teacher Ave, Islamabad",
      qualification: "MA English",
    },
  ]);

  // 2. Courses
  const [math, science, english] = await Course.insertMany([
    {
      courseCode: "MTH-201",
      courseName: "Intermediate Math",
      description: "Core mathematics, algebra and geometry.",
      courseCredit: 3,
      departmentId: "Mathematics",
      assigned: true,
    },
    {
      courseCode: "SCI-301",
      courseName: "General Science",
      description: "Integrated science: biology, chemistry, physics.",
      courseCredit: 3,
      departmentId: "Science",
      assigned: true,
    },
    {
      courseCode: "ENG-101",
      courseName: "English Language",
      description: "Reading, composition, speaking.",
      courseCredit: 3,
      departmentId: "English",
      assigned: true,
    },
  ]);

  // 3. Parent
  const parent = await Parent.create({
    firstName: "Rashid",
    lastName: "Ahmed",
    email: "rashid.ahmed@parentdemo.com",
    password: await bcrypt.hash("parent123", 10),
    phone: "03451112222",
    address: "25 Parent Town, Lahore",
    children: [], // to be filled after students are created
  });

  // 4. Students (children)
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
      studentId: "PRT-1001",
      firstName: "Ayaan",
      lastName: "Rashid",
      class: "7",
      section: "A",
      gender: "Male",
      dob: "2011-05-13",
      email: "ayaan@childdemo.com",
      phone: "03331112222",
      address: "25 Parent Town, Lahore",
      emergencyContact: "03218889999",
      enrollDate: "2021-08-01",
      expectedGraduation: gradDate("2021-08-01"),
      password: await bcrypt.hash("studpass1", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/men/40.jpg",
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
      studentId: "PRT-1002",
      firstName: "Hiba",
      lastName: "Rashid",
      class: "4",
      section: "B",
      gender: "Female",
      dob: "2014-09-23",
      email: "hiba@childdemo.com",
      phone: "03334445555",
      address: "25 Parent Town, Lahore",
      emergencyContact: "03214445555",
      enrollDate: "2023-03-15",
      expectedGraduation: gradDate("2023-03-15"),
      password: await bcrypt.hash("studpass2", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/women/41.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: false,
      honorRolls: false,
      athletics: true,
      clubs: "Science",
      lunch: "Egg",
      nationality: "Pakistani",
    },
    {
      studentId: "PRT-1003",
      firstName: "Omer",
      lastName: "Rashid",
      class: "10",
      section: "C",
      gender: "Male",
      dob: "2008-11-17",
      email: "omer@childdemo.com",
      phone: "03336667777",
      address: "25 Parent Town, Lahore",
      emergencyContact: "03217779999",
      enrollDate: "2018-04-20",
      expectedGraduation: gradDate("2018-04-20"),
      password: await bcrypt.hash("studpass3", 10),
      parents: [parent._id],
      profilePhoto: "https://randomuser.me/api/portraits/men/55.jpg",
      transcripts: [],
      reportCards: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
      iipFlag: true,
      honorRolls: false,
      athletics: false,
      clubs: "Drama",
      lunch: "Chicken",
      nationality: "Pakistani",
    },
  ]);

  // 5. Update parent's children array with the new student ObjectIds
  parent.children = [child1._id, child2._id, child3._id];
  await parent.save();

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

  // 7. Attendance (for past 5 days, each child, math course)
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
      title: "Parent-Teacher Conference",
      subtitle: "Meet your child's teachers on 10th September.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "Sports Gala",
      subtitle: "Annual sports event next month.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "School Closed - Eid Holiday",
      subtitle: "No classes on Eid days.",
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
      reason: "Fever",
      status: "approved",
      submittedAt: new Date(dateStr(1)),
    });
    await Absence.create({
      student: child._id,
      date: new Date(dateStr(3)),
      type: "partial",
      reason: "Family emergency",
      status: "pending",
      submittedAt: new Date(dateStr(3)),
    });
  }

  console.log("✅ Parent/Student demo data seeded (parent-only, no guardians)!");
  await mongoose.disconnect();
}

seed();