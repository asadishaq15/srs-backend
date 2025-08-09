// seed-parent-demo.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGODB_URL = "mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs";

function gradDate(enroll) {
  const d = new Date(enroll);
  d.setFullYear(d.getFullYear() + 5);
  return d.toISOString().split("T")[0];
}

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

async function seed() {
  // --- Connect ---
  await mongoose.connect(MONGODB_URL);

  // --- Define minimal schemas ---
  const guardianSchema = new mongoose.Schema({
    guardianName: String,
    guardianEmail: { type: String, unique: true },
    password: String,
    guardianPhone: String,
    guardianRelation: String,
    guardianProfession: String,
    guardianPhoto: { type: String, default: "N/A" }
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
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
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
  });
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

  // --- Clean up existing demo data ---
  await Promise.all([
    Parent.deleteMany({ email: "daniyal4@example.com" }),
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

  // --- Seed Teachers ---
  const [teacher1, teacher2, teacher3] = await Teacher.insertMany([
    {
      firstName: "Asad",
      lastName: "Khan",
      gender: "Male",
      phone: "03331112222",
      email: "asad.khan@school.com",
      password: await bcrypt.hash("123", 10),
      department: "Mathematics",
      assignedCourses: [],
      address: "Teacher Street, Lahore",
      qualification: "MSc Mathematics",
    },
    {
      firstName: "Fatima",
      lastName: "Ali",
      gender: "Female",
      phone: "03446667777",
      email: "fatima.ali@school.com",
      password: await bcrypt.hash("123", 10),
      department: "Science",
      assignedCourses: [],
      address: "Teacher Road, Karachi",
      qualification: "MSc Physics",
    },
    {
      firstName: "Umair",
      lastName: "Iqbal",
      gender: "Male",
      phone: "03221234567",
      email: "umair.iqbal@school.com",
      password: await bcrypt.hash("123", 10),
      department: "English",
      assignedCourses: [],
      address: "Teacher Colony, Islamabad",
      qualification: "MA English",
    },
  ]);

  // --- Seed Courses ---
  const [math, science, english] = await Course.insertMany([
    {
      courseCode: "MATH-101",
      courseName: "Mathematics",
      description: "Core Math",
      courseCredit: 3,
      departmentId: "Mathematics",
      assigned: true,
    },
    {
      courseCode: "SCI-201",
      courseName: "Science",
      description: "General Science",
      courseCredit: 3,
      departmentId: "Science",
      assigned: true,
    },
    {
      courseCode: "ENG-301",
      courseName: "English",
      description: "English Literature",
      courseCredit: 3,
      departmentId: "English",
      assigned: true,
    },
  ]);

  // --- Seed Guardians ---
  const [guardian1, guardian2, guardian3] = await Guardian.insertMany([
    {
      guardianName: "Sadia Ahmed",
      guardianEmail: "sadia1@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03338887777",
      guardianRelation: "Mother",
      guardianProfession: "Engineer",
      guardianPhoto: "N/A",
    },
    {
      guardianName: "Imran Ahmed",
      guardianEmail: "imran2@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03112223344",
      guardianRelation: "Father",
      guardianProfession: "Doctor",
      guardianPhoto: "N/A",
    },
    {
      guardianName: "Ayesha Ahmed",
      guardianEmail: "ayesha3@guardian.com",
      password: await bcrypt.hash("123", 10),
      guardianPhone: "03113334455",
      guardianRelation: "Mother",
      guardianProfession: "Teacher",
      guardianPhoto: "N/A",
    },
  ]);

  // --- Seed Students (children) ---
  const [child1, child2, child3] = await Student.insertMany([
    {
      studentId: "AYN-1001",
      firstName: "Asad",
      lastName: "Ahmed",
      class: "6",
      section: "A",
      gender: "Male",
      dob: "2013-04-15",
      email: "asad@child.com",
      phone: "03120001111",
      address: "123 Parent Street, Lahore",
      emergencyContact: "03331114567",
      enrollDate: "2020-08-15",
      expectedGraduation: gradDate("2020-08-15"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian1._id,
      profilePhoto: "https://i.pravatar.cc/150?img=10",
      transcripts: [],
      reportCards: [],
    },
    {
      studentId: "ZYA-1002",
      firstName: "Areeba",
      lastName: "Ahmed",
      class: "3",
      section: "B",
      gender: "Female",
      dob: "2016-07-22",
      email: "areeba@child.com",
      phone: "03123456789",
      address: "123 Parent Street, Lahore",
      emergencyContact: "03334445555",
      enrollDate: "2022-08-20",
      expectedGraduation: gradDate("2022-08-20"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian2._id,
      profilePhoto: "https://i.pravatar.cc/150?img=20",
      transcripts: [],
      reportCards: [],
    },
    {
      studentId: "SRA-1003",
      firstName: "Sara",
      lastName: "Ahmed",
      class: "9",
      section: "C",
      gender: "Female",
      dob: "2010-01-05",
      email: "sara@child.com",
      phone: "03129876543",
      address: "123 Parent Street, Lahore",
      emergencyContact: "03337778888",
      enrollDate: "2018-08-10",
      expectedGraduation: gradDate("2018-08-10"),
      password: await bcrypt.hash("123", 10),
      guardian: guardian3._id,
      profilePhoto: "https://i.pravatar.cc/150?img=30",
      transcripts: [],
      reportCards: [],
    },
  ]);

  // --- Seed Parent ---
  const parent = await Parent.create({
    firstName: "Daniyal",
    lastName: "Ahmed",
    email: "daniyal4@example.com",
    password: await bcrypt.hash("123", 10),
    phone: "03451234567",
    address: "123 Parent Street, Lahore",
    children: [child1._id, child2._id, child3._id],
  });

  // --- Seed Schedules (Mon-Fri, each child, each course) ---
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const scheduleArr = [];
  for (const [child, childCourses, section, teacher] of [
    [child1, [math, science, english], "A", teacher1],
    [child2, [english, math, science], "B", teacher2],
    [child3, [science, english, math], "C", teacher3],
  ]) {
    for (let i = 0; i < weekDays.length; i++) {
      scheduleArr.push({
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
  await Schedule.insertMany(scheduleArr);

  // --- Seed Attendance (past 5 days, for each child, for each course) ---
  for (const child of [child1, child2, child3]) {
    for (const [course, teacher] of [
      [math, teacher1],
      [science, teacher2],
      [english, teacher3],
    ]) {
      for (let i = 0; i < 5; i++) {
        await Attendance.create({
          teacherId: teacher._id,
          courseId: course._id,
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
  }

  // --- Seed Grades (each child, multiple courses) ---
  for (const [child, teacher, courses] of [
    [child1, teacher1, [math, science, english]],
    [child2, teacher2, [english, math, science]],
    [child3, teacher3, [science, english, math]],
  ]) {
    for (const course of courses) {
      await Grade.create({
        teacherId: teacher._id,
        courseId: course._id,
        studentId: child._id,
        class: child.class,
        section: child.section,
        term: "Spring 2024",
        quiz: { score: Math.floor(Math.random()*5)+15, weightage: 20 },
        midTerm: { score: Math.floor(Math.random()*10)+35, weightage: 40 },
        project: { score: Math.floor(Math.random()*5)+15, weightage: 20 },
        finalTerm: { score: Math.floor(Math.random()*8)+15, weightage: 20 },
        overAll: 90 + Math.floor(Math.random() * 10),
      });
    }
  }

  // --- Seed Activities (Announcements & Events) ---
  await Activity.insertMany([
    {
      title: "Parent-Teacher Meeting",
      subtitle: "All parents are invited on 15th Sept.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "Science Fair",
      subtitle: "Annual event for science projects.",
      performBy: "Admin",
      createdAt: new Date(),
    },
    {
      title: "School Closed for Eid",
      subtitle: "School will remain closed from 16th-18th June.",
      performBy: "Admin",
      createdAt: new Date(),
    },
  ]);

  // --- Seed Absences (for each child, multiple) ---
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