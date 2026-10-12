const cron = require("node-cron");
const { denyExpiredCODOrders } = require("./denyExpiredCODOrders.worker");
const { packageExpiryReminder } = require("./packageExpiryReminder.worker");
const { deleteDisabledUsers } = require("./deleteDisabledUsers.worker");

// Every hour
cron.schedule("0 0 * * *", async () => {
    console.log("Running Expired COD Order Worker...");
    await denyExpiredCODOrders();
});

cron.schedule("5 0 * * *", async () => {
    console.log("Running Package Expiry Reminder...");
    await packageExpiryReminder();
});

cron.schedule("10 0 * * *", async () => {
    console.log("Running Disabled User Cleanup...");
    await deleteDisabledUsers();
});

console.log("Cron jobs started.");