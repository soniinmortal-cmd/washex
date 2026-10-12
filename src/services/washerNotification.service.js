const {
    WasherDevice,
    Washer,
    WasherNotification
} = require("../models");

const washerAdmin = require("../config/firebaseWasher");

const saveWasherFcmToken = async (
    body
) => {
     const {washerId,fcmToken,deviceType}=body;

    if (!washerId || !fcmToken || !deviceType) {
        throw new Error("inputs missing");
    }
    console.log(deviceType);
    if (!["ANDROID", "IOS"].includes(deviceType)) {
        throw new Error("invalid device type");
    }

    const existing = await WasherDevice.findOne({
        where: {
            washerId
        }
    });

    if (existing) {

        await existing.update({
            washerId,
            fcmToken,
            deviceType,
            isActive: true
        });

        return "fcm token updated successfully";
    }

    await WasherDevice.create({
        washerId,
        fcmToken,
        deviceType,
        isActive: true
    });

    return "fcm token created successfully";
};

const createWasherNotification = async (
    washerId,
    type,
    referenceId,
    title,
    message
) => {

    if (
        !washerId ||
        !type ||
        !title ||
        !message
    ) {
        throw new Error("inputs missing");
    }

    return await WasherNotification.create({
        washerId,
        type,
        referenceId,
        title,
        message,
        isRead: false
    });
};

const getWasherNotifications = async (
    washerId
) => {

    if (!washerId) {
        throw new Error("inputs missing");
    }

    const washer = await Washer.findByPk(
        washerId
    );

    if (!washer) {
        throw new Error("invalid washer");
    }

    const notifications =
        await WasherNotification.findAll({
            where: {
                washerId
            },
            order: [["createdAt", "DESC"]]
        });

    return notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        date: notification.createdAt.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }),
        time: notification.createdAt.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        })
    }));
};

const getUnreadWasherNotificationCount =
async (washerId) => {

    if (!washerId) {
        throw new Error("inputs missing");
    }

    const washer = await Washer.findByPk(
        washerId
    );

    if (!washer) {
        throw new Error("invalid washer");
    }

    return await WasherNotification.count({
        where: {
            washerId,
            isRead: false
        }
    });
};

const sendNotificationToWasher = async (
    washerId,
    title,
    body
) => {

    if (
        !washerId ||
        !title ||
        !body
    ) {
        throw new Error("inputs missing");
    }

    const device =
        await WasherDevice.findOne({
            where: {
                washerId,
                isActive: true
            }
        });

    if (!device) {
        return;
    }

    const response =
        await washerAdmin.messaging().send({
            token: device.fcmToken,
            notification: {
                title,
                body
            }
        });

    console.log(response);
};

const markWasherNotificationRead =
async (washerId) => {

    if (!washerId) {
        throw new Error("inputs missing");
    }

    const washer = await Washer.findByPk(
        washerId
    );

    if (!washer) {
        throw new Error("invalid washer");
    }

    await WasherNotification.update(
        {
            isRead: true
        },
        {
            where: {
                washerId,
                isRead: false
            }
        }
    );
};

module.exports = {
    saveWasherFcmToken,
    createWasherNotification,
    getWasherNotifications,
    getUnreadWasherNotificationCount,
    sendNotificationToWasher,
    markWasherNotificationRead
};