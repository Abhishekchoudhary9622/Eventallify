import { MongoClient, Db } from "mongodb";
import {
  UserDoc,
  SessionDoc,
  AccountDoc,
  VerificationDoc,
  RateLimitDoc,
  EventDoc,
  RegistrationDoc,
  AnnouncementDoc,
  BookmarkDoc,
  NotificationDoc,
  CertificateDoc,
  FeedbackDoc,
  COLLECTIONS,
} from "@/db/schema";

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/eventallify";

const options = {
  maxPoolSize: 10,
};

let client: MongoClient;
let db: Db;

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
  _indexesCreated?: boolean;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalForMongo._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

db = client.db();

// Helper functions for typed collections
export const collections = {
  users: () => db.collection<UserDoc>(COLLECTIONS.USER),
  sessions: () => db.collection<SessionDoc>(COLLECTIONS.SESSION),
  accounts: () => db.collection<AccountDoc>(COLLECTIONS.ACCOUNT),
  verifications: () => db.collection<VerificationDoc>(COLLECTIONS.VERIFICATION),
  rateLimits: () => db.collection<RateLimitDoc>(COLLECTIONS.RATE_LIMIT),
  events: () => db.collection<EventDoc>(COLLECTIONS.EVENTS),
  registrations: () => db.collection<RegistrationDoc>(COLLECTIONS.REGISTRATIONS),
  announcements: () => db.collection<AnnouncementDoc>(COLLECTIONS.ANNOUNCEMENTS),
  bookmarks: () => db.collection<BookmarkDoc>(COLLECTIONS.BOOKMARKS),
  notifications: () => db.collection<NotificationDoc>(COLLECTIONS.NOTIFICATIONS),
  certificates: () => db.collection<CertificateDoc>(COLLECTIONS.CERTIFICATES),
  feedback: () => db.collection<FeedbackDoc>(COLLECTIONS.FEEDBACK),
};

export async function ensureIndexes() {
  if (globalForMongo._indexesCreated) return;
  try {
    const eventsCol = collections.events();
    const regCol = collections.registrations();
    const annCol = collections.announcements();
    const bookmarksCol = collections.bookmarks();
    const notifsCol = collections.notifications();
    const certsCol = collections.certificates();
    const feedbackCol = collections.feedback();

    await eventsCol.createIndex({ date: -1 });
    await eventsCol.createIndex({ status: 1 });
    await eventsCol.createIndex({ createdBy: 1 });
    await eventsCol.createIndex({ id: 1 }, { unique: true, sparse: true });
    
    await regCol.createIndex({ userId: 1, eventId: 1 });
    await regCol.createIndex({ userId: 1 });
    await regCol.createIndex({ eventId: 1, status: 1 });
    await regCol.createIndex({ id: 1 }, { unique: true, sparse: true });

    await annCol.createIndex({ createdAt: -1 });
    await annCol.createIndex({ eventId: 1 });
    await annCol.createIndex({ id: 1 }, { unique: true, sparse: true });

    await bookmarksCol.createIndex({ userId: 1, eventId: 1 });
    await bookmarksCol.createIndex({ userId: 1 });

    await notifsCol.createIndex({ userId: 1, read: 1 });
    await notifsCol.createIndex({ userId: 1, createdAt: -1 });

    await certsCol.createIndex({ id: 1 }, { unique: true, sparse: true });
    await certsCol.createIndex({ verificationCode: 1 }, { unique: true, sparse: true });
    await certsCol.createIndex({ userId: 1, eventId: 1 });

    await feedbackCol.createIndex({ eventId: 1 });
    await feedbackCol.createIndex({ userId: 1, eventId: 1 });

    globalForMongo._indexesCreated = true;
  } catch (e) {
    // Indexes might already exist with different params
  }
}

export { client, db };
