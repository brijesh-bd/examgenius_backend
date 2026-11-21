// Give a student Pro manually (until in-app payment is wired):
//   npm run grant-pro -- 9876543210 30      (mobile or email, days)
//   npm run grant-pro -- asha@example.com 365
import { config } from '../src/config.js';
import { connectDb } from '../src/db.js';
import { SubscriptionService } from '../src/services/subscription.js';
import { UserStore } from '../src/services/userStore.js';

const [identifier, daysArg = '30'] = process.argv.slice(2);
const days = Number(daysArg);
if (!identifier || !Number.isFinite(days) || days <= 0) {
  console.error('Usage: npm run grant-pro -- <mobile|email> <days>');
  process.exit(1);
}

const db = await connectDb(config.mongo);
try {
  const user = await new UserStore(db.users).findByIdentifier(identifier);
  if (!user) {
    console.error(`No account found for "${identifier}"`);
    process.exitCode = 1;
  } else {
    const updated = await new SubscriptionService(db, config.plans).grantPro(user._id, days, 'manual');
    console.log(`${updated.name} (${updated.mobile}) is Pro until ${new Date(updated.plan.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  }
} finally {
  await db.client.close();
}
