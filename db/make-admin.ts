import "dotenv/config";
import { MongoClient } from "mongodb";
import { UserDoc, COLLECTIONS } from "./schema";

const email = process.argv[2];

if (!email) {
  console.log("Usage: npm run db:make-admin <email>");
  process.exit(1);
}

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/eventallify";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const usersCol = db.collection<UserDoc>(COLLECTIONS.USER);

  const result = await usersCol.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: "admin", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    console.log(`User with email "${email}" not found.`);
  } else {
    console.log(`User "${result.name}" (${email}) is now an admin!`);
  }

  await client.close();
}

main().catch(console.error);
