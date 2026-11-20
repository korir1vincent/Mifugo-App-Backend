const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

// EXPO_ACCESS_TOKEN is optional (only needed if you turn on "Enhanced Push
// Security" in your Expo account).
const expo = new Expo(
  process.env.EXPO_ACCESS_TOKEN
    ? { accessToken: process.env.EXPO_ACCESS_TOKEN }
    : {}
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Remove tokens Expo says no longer work (app uninstalled, token rotated...)
const pruneTokens = async (userId, badTokens) => {
  if (!badTokens.length) return;
  await User.updateOne(
    { _id: userId },
    { $pull: { pushTokens: { $in: badTokens } } }
  );
};

/**
 * Send one notification to every device a user is logged in on.
 * Returns { sent, errors } where errors is a list of readable strings.
 */
const sendPushToUser = async (user, { title, body, data = {} }) => {
  const tokens = (user.pushTokens || []).filter((t) => Expo.isExpoPushToken(t));
  if (!tokens.length) return { sent: 0, errors: ["No registered devices"] };

  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title,
    body,
    data,
    channelId: "default",
    priority: "high",
  }));

  const errors = [];
  const badTokens = [];
  const ticketIds = [];
  let sent = 0;

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === "ok") {
          sent += 1;
          ticketIds.push(ticket.id);
        } else {
          errors.push(ticket.message || "Unknown push error");
          if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
            badTokens.push(chunk[i].to);
          }
        }
      });
    } catch (err) {
      errors.push(err.message);
    }
  }

  await pruneTokens(user._id, badTokens);
  return { sent, errors, ticketIds };
};

/**
 * Same as sendPushToUser, but respects the farmer's notification settings.
 * category: reminders | healthAlerts | inventoryAlerts | financialReports
 */
const CATEGORY_DEFAULTS = {
  reminders: true,
  healthAlerts: true,
  inventoryAlerts: false,
  financialReports: false,
};

const notifyUser = async (user, category, payload) => {
  const settings = user.notificationSettings || {};
  const enabled =
    settings[category] !== undefined
      ? settings[category]
      : CATEGORY_DEFAULTS[category];

  if (!enabled) {
    return { sent: 0, errors: ["Category disabled"], skipped: true };
  }
  return sendPushToUser(user, payload);
};

/**
 * Push tickets only say "Expo accepted it". Whether Google/Apple accepted it
 * shows up in the receipt a few seconds later (this is where a missing FCM
 * credential appears). Used by the "send test notification" button.
 */
const checkReceipts = async (ticketIds, waitMs = 5000) => {
  if (!ticketIds.length) return [];
  await sleep(waitMs);
  const problems = [];
  try {
    const receipts = await expo.getPushNotificationReceiptsAsync(ticketIds);
    Object.values(receipts).forEach((receipt) => {
      if (receipt.status === "error") {
        problems.push({
          error: receipt.details && receipt.details.error,
          message: receipt.message,
        });
      }
    });
  } catch (err) {
    problems.push({ error: "ReceiptLookupFailed", message: err.message });
  }
  return problems;
};

module.exports = {
  expo,
  isExpoPushToken: (t) => Expo.isExpoPushToken(t),
  sendPushToUser,
  notifyUser,
  checkReceipts,
};
