import { MongoClient, ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";

// Load URI and seed password from environment
const uri = process.env.MONGO_URI || "mongodb+srv://123:123@e-store.uf5qztz.mongodb.net/srs";
const seedPassword = process.env.SEED_PASSWORD || "123";
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db("srs");
    const studentsCollection = db.collection("students");
    const parentsCollection = db.collection("parents");

    // 0. Remove all existing parent records
    console.log("Deleting all existing parent records...");
    const delParents = await parentsCollection.deleteMany({});
    console.log(`Deleted ${delParents.deletedCount} parent records`);

    // 1. Hash password once for all records
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(seedPassword, salt);

    // Students to seed
    const studentsToSeed = [
      { studentId: "ST001", firstName: "Emma", lastName: "Johnson", class: "9", section: "A", gender: "Female" /* ... */ },
      { studentId: "ST002", firstName: "Liam", lastName: "Johnson", class: "7", section: "B", gender: "Male" /* ... */ },
    ];

    const studentIds: ObjectId[] = [];
    for (const seed of studentsToSeed) {
      // Delete existing student with same studentId
      const deleted = await studentsCollection.deleteMany({ studentId: seed.studentId });
      if (deleted.deletedCount) {
        console.log(`Deleted ${deleted.deletedCount} existing record(s) for studentId ${seed.studentId}`);
      }

      // Insert fresh student record
      const studentData = {
        ...seed,
        email: `${seed.firstName.toLowerCase()}.${seed.lastName.toLowerCase()}@student.example.com`,
        phone: "555-xxx-xxxx",
        password: hashedPassword,
        guardian: null,
        profilePhoto: "/students/default.jpg",
        transcripts: [],
        iipFlag: false,
        honorRolls: false,
        athletics: false,
        clubs: "",
        lunch: "",
        nationality: "Unknown",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await studentsCollection.insertOne(studentData);
      console.log(`Inserted student ${seed.studentId}: ${result.insertedId}`);
      studentIds.push(result.insertedId);
    }

    // 2. Insert a fresh parent linked to these students
    const parent = {
      firstName: "Alice",
      lastName: "Smith",
      email: "freshparent@example.com",
      password: hashedPassword,
      phone: "555-888-8888",
      address: "200 New Lane, Cityville",
      children: studentIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const parentRes = await parentsCollection.insertOne(parent);
    console.log(`✅ Created parent with _id: ${parentRes.insertedId}`);
    const parentDoc = await parentsCollection.findOne({ _id: parentRes.insertedId });
    console.log("Parent doc:", parentDoc);

  } catch (error) {
    console.error("Error in seeding script:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
