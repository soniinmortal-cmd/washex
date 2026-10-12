const { Op } = require("sequelize");
const { UserLimitPackage } = require("../models/userLimitPackage.model");
const notificationService = require("../services/notification.service");

const packageExpiryReminder = async () => {
    try {
        const targetDate = new Date();

        // 3 days from today
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const packages = await UserLimitPackage.findAll({
            where: {
                paymentStatus: "SUCCESS",
                expiresAt: {
                    [Op.gte]: targetDate,
                    [Op.lt]: nextDay
                }
            }
        });

        console.log(
            `Found ${packages.length} packages expiring in exactly 3 days.`
        );

        for (const pkg of packages) {

            const title = "Package Expiring Soon";

            const message =
                "Your laundry package will expire in 3 days. Please renew it to continue enjoying your benefits.";

            await notificationService.createNotification(
                pkg.userId,
                "PACKAGE_EXPIRY",
                pkg.id,
                title,
                message
            );

            await notificationService.sendNotificationToUser(
                pkg.userId,
                title,
                message
            );

            console.log(
                `Reminder sent to user ${pkg.userId} for package ${pkg.id}`
            );
        }
    } catch (err) {
        console.error("Package Expiry Reminder Worker:", err);
    }
};

module.exports = {
    packageExpiryReminder
};