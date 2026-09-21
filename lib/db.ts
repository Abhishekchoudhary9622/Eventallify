import { MongoClient, Db, ObjectId, Filter } from "mongodb";

export function buildIdQuery<T = any>(id: string): Filter<T> {
  if (!id) return { id } as unknown as Filter<T>;
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return {
      $or: [{ id }, { _id: new ObjectId(id) }],
    } as unknown as Filter<T>;
  }
  return { id } as unknown as Filter<T>;
}

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
  maxPoolSize: 20,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 20000,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let db: Db;

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
  _indexesCreated?: boolean;
};

if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = new MongoClient(uri, options);
}
client = globalForMongo._mongoClient;
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

// Non-blocking index creation (executes asynchronously in background)
export function ensureIndexes() {
  if (globalForMongo._indexesCreated) return;
  globalForMongo._indexesCreated = true;

  Promise.resolve().then(async () => {
    try {
      const eventsCol = collections.events();
      const regCol = collections.registrations();
      const annCol = collections.announcements();
      const bookmarksCol = collections.bookmarks();
      const notifsCol = collections.notifications();
      const certsCol = collections.certificates();
      const feedbackCol = collections.feedback();

      await Promise.allSettled([
        eventsCol.createIndex({ date: -1 }),
        eventsCol.createIndex({ status: 1 }),
        eventsCol.createIndex({ createdBy: 1 }),
        eventsCol.createIndex({ id: 1 }, { unique: true, sparse: true }),
        regCol.createIndex({ userId: 1, eventId: 1 }),
        regCol.createIndex({ eventId: 1, status: 1 }),
        regCol.createIndex({ id: 1 }, { unique: true, sparse: true }),
        annCol.createIndex({ createdAt: -1 }),
        bookmarksCol.createIndex({ userId: 1, eventId: 1 }),
        notifsCol.createIndex({ userId: 1, read: 1 }),
        notifsCol.createIndex({ userId: 1, createdAt: -1 }),
        certsCol.createIndex({ id: 1 }, { unique: true, sparse: true }),
        certsCol.createIndex({ verificationCode: 1 }, { unique: true, sparse: true }),
        feedbackCol.createIndex({ eventId: 1 }),
      ]);
    } catch {
      // Indexes already in place
    }
  });
}

export { client, db };
