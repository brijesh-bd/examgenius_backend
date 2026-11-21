import crypto from 'node:crypto';

/** MongoDB-backed user accounts (`users` collection). */
export class UserStore {
  /** @param {import('mongodb').Collection} collection */
  constructor(collection) {
    this.col = collection;
  }

  findByMobile(mobile) {
    return this.col.findOne({ mobile });
  }

  findByEmail(email) {
    return this.col.findOne({ email: email.trim().toLowerCase() });
  }

  /** Login identifier: email if it contains "@", otherwise mobile. */
  findByIdentifier(identifier) {
    const id = identifier.trim();
    return id.includes('@') ? this.findByEmail(id) : this.findByMobile(id);
  }

  findById(id) {
    return this.col.findOne({ _id: id });
  }

  async create(data) {
    const user = {
      _id: crypto.randomUUID(),
      createdAt: new Date(),
      stats: { generations: 0, questionsGenerated: 0 },
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : null,
    };
    await this.col.insertOne(user);
    return user;
  }

  update(id, patch) {
    return this.col.findOneAndUpdate({ _id: id }, { $set: patch }, { returnDocument: 'after' });
  }

  async incrementStats(id, { generations = 0, questionsGenerated = 0 }) {
    await this.col.updateOne(
      { _id: id },
      { $inc: { 'stats.generations': generations, 'stats.questionsGenerated': questionsGenerated } },
    );
  }
}

/** Public shape — matches the app's StudentUser.fromJson. Never leaks the hash. */
export function toPublicUser(u) {
  return {
    id: u._id,
    name: u.name,
    mobile: u.mobile,
    email: u.email ?? null,
    targetExamId: u.targetExamId,
  };
}
