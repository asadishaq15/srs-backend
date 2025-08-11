// seed-parent-demo.js (updated for 5 children and new parent)
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
    Parent.deleteMany({ email: /@demo\.com/ }),
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
    firstName: "Daniyal",
    lastName: "Qamar",
    email: "daniyalqamar155@demo.com",
    password: await bcrypt.hash("parent123", 10),
    phone: "03451112222",
    address: "99 New Parent Town, Lahore",
    children: [], // to be filled after students are created
  });

  // 4. Students (5 children)
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
      studentId: "DQ-2001",
      firstName: "Ali",
      lastName: "Daniyal",
      class: "6",
      section: "A",
      gender: "Male",
      dob: "2012-04-10",
      email: "ali@childdemo.com",
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
      studentId: "DQ-2002",
      firstName: "Sara",
      lastName: "Daniyal",
      class: "3",
      section: "B",
      gender: "Female",
      dob: "2015-06-22",
      email: "sara@childdemo.com",
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
      studentId: "DQ-2003",
      firstName: "Hassan",
      lastName: "Daniyal",
      class: "9",
      section: "C",
      gender: "Male",
      dob: "2009-11-05",
      email: "hassan@childdemo.com",
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
      studentId: "DQ-2004",
      firstName: "Alina",
      lastName: "Daniyal",
      class: "8",
      section: "D",
      gender: "Female",
      dob: "2010-09-18",
      email: "alina@childdemo.com",
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
      studentId: "DQ-2005",
      firstName: "Zain",
      lastName: "Daniyal",
      class: "5",
      section: "E",
      gender: "Male",
      dob: "2013-12-30",
      email: "zain@childdemo.com",
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

  // 5. Update parent's children array with the new student ObjectIds
  parent.children = [child1._id, child2._id, child3._id, child4._id, child5._id];
  await parent.save();

  // 6. Schedule (Mon-Fri, 1-2 periods per day, different courses)
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const childrenArr = [
    [child1, [math, science, english], "A", teacher1],
    [child2, [english, math, science], "B", teacher2],
    [child3, [science, english, math], "C", teacher3],
    [child4, [math, english, science], "D", teacher1],
    [child5, [science, math, english], "E", teacher2],
  ];
  const schedules = [];
  for (const [child, childCourses, section, teacher] of childrenArr) {
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
  for (const child of [child1, child2, child3, child4, child5]) {
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
  const terms = ["Spring 2024", "Spring 2024", "Spring 2024", "Spring 2024", "Spring 2024"];
  const courseList = [math, science, english];
  const teacherList = [teacher1, teacher2, teacher3];

  for (const [i, child] of [child1, child2, child3, child4, child5].entries()) {
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
  for (const child of [child1, child2, child3, child4, child5]) {
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

  console.log("✅ Parent/Student demo data seeded with 5 children and parent Daniyal Qamar!");
  await mongoose.disconnect();
}

seed();