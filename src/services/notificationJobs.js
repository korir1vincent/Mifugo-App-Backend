const User = require("../models/User");
const Reminder = require("../models/Reminder");
const Inventory = require("../models/Inventory");
const Expense = require("../models/Expense");
const Revenue = require("../models/Revenue");
const { notifyUser } = require("./pushService");

// Amounts are shown in KES for now (multi-currency is not part of this update)
const formatMoney = (amount) =>
  `KES ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Farmers get scheduled notifications between these local hours
const SEND_FROM_HOUR = 8;
const SEND_UNTIL_HOUR = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ============================================================
   TIME HELPERS (everything is evaluated in the farmer's time zone)
============================================================ */

const safeTimeZone = (tz) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch (e) {
    return "Africa/Nairobi";
  }
};

const localParts = (date, tz) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: safeTimeZone(tz),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      weekday: "short",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return {
    dayKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: parseInt(parts.hour, 10) % 24,
    weekday: parts.weekday, // Mon, Tue...
  };
};

const dayKeyToUtc = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

// whole calendar days from a to b (both "YYYY-MM-DD")
const dayDiff = (a, b) => Math.round((dayKeyToUtc(b) - dayKeyToUtc(a)) / DAY_MS);

const isoWeekKey = (dayKey) => {
  const d = new Date(dayKeyToUtc(dayKey));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d - yearStart) / DAY_MS + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const inSendWindow = (hour) => hour >= SEND_FROM_HOUR && hour <= SEND_UNTIL_HOUR;

const hasDevice = (user) => user.pushTokens && user.pushTokens.length > 0;

const groupBy = (list, keyFn) =>
  list.reduce((acc, item) => {
    const key = String(keyFn(item));
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

const summarise = (names, max = 3) => {
  const shown = names.slice(0, max).join(", ");
  return names.length > max ? `${shown} +${names.length - max} more` : shown;
};

/* ============================================================
   REMINDERS  ->  "due tomorrow" and "due today"
============================================================ */

const processReminders = async (now = new Date()) => {
  const reminders = await Reminder.find({
    completed: false,
    notifiedDue: { $ne: true },
    date: { $gte: new Date(now.getTime() - 7 * DAY_MS), $lte: new Date(now.getTime() + 2 * DAY_MS) },
    // don't ping someone seconds after they created the reminder
    createdAt: { $lt: new Date(now.getTime() - 30 * 60 * 1000) },
  }).populate("animalId", "name tagId");

  if (!reminders.length) return 0;

  const byUser = groupBy(reminders, (r) => r.userId);
  const users = await User.find({ _id: { $in: Object.keys(byUser) } });
  let sentCount = 0;

  for (const user of users) {
    if (!hasDevice(user)) continue;
    const local = localParts(now, user.timezone);
    if (!inSendWindow(local.hour)) continue;

    const mine = byUser[String(user._id)] || [];
    const dueToday = [];
    const dueTomorrow = [];

    mine.forEach((r) => {
      const diff = dayDiff(local.dayKey, localParts(r.date, user.timezone).dayKey);
      if (diff <= 0) dueToday.push(r);
      else if (diff === 1 && !r.notifiedDayBefore) dueTomorrow.push(r);
    });

    const label = (r) => {
      const animal = r.animalId && r.animalId.name ? ` (${r.animalId.name})` : "";
      return `${r.description}${animal}`;
    };

    if (dueToday.length) {
      const res = await notifyUser(user, "reminders", {
        title:
          dueToday.length === 1
            ? `Reminder: ${dueToday[0].type}`
            : `${dueToday.length} reminders due today`,
        body: summarise(dueToday.map(label)),
        data: { screen: "Reminders" },
      });
      if (res.sent > 0) {
        sentCount += 1;
        await Reminder.updateMany(
          { _id: { $in: dueToday.map((r) => r._id) } },
          { $set: { notifiedDue: true, notifiedDayBefore: true } }
        );
      }
    }

    if (dueTomorrow.length) {
      const res = await notifyUser(user, "reminders", {
        title:
          dueTomorrow.length === 1
            ? `Tomorrow: ${dueTomorrow[0].type}`
            : `${dueTomorrow.length} reminders due tomorrow`,
        body: summarise(dueTomorrow.map(label)),
        data: { screen: "Reminders" },
      });
      if (res.sent > 0) {
        sentCount += 1;
        await Reminder.updateMany(
          { _id: { $in: dueTomorrow.map((r) => r._id) } },
          { $set: { notifiedDayBefore: true } }
        );
      }
    }
  }

  return sentCount;
};

/* ============================================================
   LOW STOCK
============================================================ */

const processLowStock = async (now = new Date()) => {
  // Restocked items can alert again next time they run low
  await Inventory.updateMany(
    { lowStockNotified: true, $expr: { $gt: ["$quantity", "$minQuantity"] } },
    { $set: { lowStockNotified: false } }
  );

  const items = await Inventory.find({
    lowStockNotified: { $ne: true },
    $expr: { $lte: ["$quantity", "$minQuantity"] },
  });
  if (!items.length) return 0;

  const byUser = groupBy(items, (i) => i.userId);
  const users = await User.find({ _id: { $in: Object.keys(byUser) } });
  let sentCount = 0;

  for (const user of users) {
    if (!hasDevice(user)) continue;
    if (!inSendWindow(localParts(now, user.timezone).hour)) continue;

    const mine = byUser[String(user._id)] || [];
    const res = await notifyUser(user, "inventoryAlerts", {
      title: mine.length === 1 ? "Low stock" : `${mine.length} items running low`,
      body: summarise(mine.map((i) => `${i.name} (${i.quantity} ${i.unit} left)`)),
      data: { screen: "Inventory" },
    });
    if (res.sent > 0) {
      sentCount += 1;
      await Inventory.updateMany(
        { _id: { $in: mine.map((i) => i._id) } },
        { $set: { lowStockNotified: true } }
      );
    }
  }
  return sentCount;
};

/* ============================================================
   WEEKLY FINANCIAL SUMMARY (Mondays, in the farmer's currency)
============================================================ */

const sumSince = async (Model, userId, since) => {
  const rows = await Model.aggregate([
    { $match: { userId, date: { $gte: since } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows.length ? rows[0].total : 0;
};

const processWeeklySummaries = async (now = new Date()) => {
  const users = await User.find({
    "notificationSettings.financialReports": true,
    "pushTokens.0": { $exists: true },
  });
  let sentCount = 0;

  for (const user of users) {
    const local = localParts(now, user.timezone);
    if (local.weekday !== "Mon" || !inSendWindow(local.hour)) continue;

    const weekKey = isoWeekKey(local.dayKey);
    if (user.lastWeeklySummaryKey === weekKey) continue;

    const since = new Date(now.getTime() - 7 * DAY_MS);
    const [spent, earned] = await Promise.all([
      sumSince(Expense, user._id, since),
      sumSince(Revenue, user._id, since),
    ]);

    if (spent === 0 && earned === 0) {
      await User.updateOne({ _id: user._id }, { $set: { lastWeeklySummaryKey: weekKey } });
      continue;
    }

    const res = await notifyUser(user, "financialReports", {
      title: "Your weekly farm summary",
      body: `Spent ${formatMoney(spent)} · Earned ${formatMoney(
        earned)} · Net ${formatMoney(earned - spent)}`,
      data: { screen: "Financial" },
    });
    if (res.sent > 0) {
      sentCount += 1;
      await User.updateOne({ _id: user._id }, { $set: { lastWeeklySummaryKey: weekKey } });
    }
  }
  return sentCount;
};

/* ============================================================
   HEALTH ALERT (event driven, called when an animal's status changes)
============================================================ */

const ALERT_STATUSES = ["Sick", "Under Treatment", "Quarantine"];

const notifyAnimalHealthChange = async (userId, animal, previousStatus) => {
  try {
    if (!animal || !ALERT_STATUSES.includes(animal.healthStatus)) return;
    if (previousStatus === animal.healthStatus) return;

    const user = await User.findById(userId);
    if (!user || !hasDevice(user)) return;

    const name = animal.name || animal.tagId || "An animal";
    await notifyUser(user, "healthAlerts", {
      title: "Health alert",
      body: `${name} is now marked as ${animal.healthStatus}`,
      data: { screen: "AnimalDetail", animalId: String(animal._id) },
    });
  } catch (err) {
    console.error("Health alert push failed:", err.message);
  }
};

/* ============================================================
   RUNNER
============================================================ */

let running = false;

const runAllJobs = async () => {
  if (running) return { skipped: true };
  running = true;
  const result = {};
  try {
    for (const [name, job] of [
      ["reminders", processReminders],
      ["lowStock", processLowStock],
      ["weeklySummaries", processWeeklySummaries],
    ]) {
      try {
        result[name] = await job(new Date());
      } catch (err) {
        console.error(`Notification job "${name}" failed:`, err);
        result[name] = `error: ${err.message}`;
      }
    }
  } finally {
    running = false;
  }
  return result;
};

module.exports = {
  runAllJobs,
  processReminders,
  processLowStock,
  processWeeklySummaries,
  notifyAnimalHealthChange,
  // exported for tests
  localParts,
  dayDiff,
  isoWeekKey,
};
