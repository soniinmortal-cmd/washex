const { UserDevice, User, Notification } = require("../models");
const admin = require("../config/firebase");

const saveFcmToken = async(userId,fcmToken,deviceType)=>{

    if(!userId || !fcmToken || !deviceType){
        throw new Error('inputs missing');
    }

    if(
        !["ANDROID","IOS"]
        .includes(deviceType)
    ){
        throw new Error(
            "invalid device type"
        );
    }

    const existing = await UserDevice.findOne({
        where : {
            userId
        }
    });

    if(existing){
        await existing.update({
            userId,
            deviceType,
            isActive:true,
            fcmToken
        });

        return "fcm token updated successfully";
    }else{
        await UserDevice.create({
            userId,
            deviceType,
            fcmToken,
            isActive:true
        });

        return "fcm token created successfully";
    }
}

const createNotification = async (
    userId,
    type,
    referenceId,
    title,
    message
)=>{

    if(
        !userId ||
        !type ||
        !title ||
        !message
    ){
        throw new Error(
            "inputs missing"
        );
    }

    const notification =
        await Notification.create({
            userId,
            type,
            referenceId,
            title,
            message,
            isRead:false
        });

    return notification;
}

const getNotifications = async(userId)=>{

    if(!userId){
        throw new Error('inputs missing');
    }

    const check = await User.findByPk(userId);

    if(!check){
        throw new Error('invalid user');
    }

    const notifications = await Notification.findAll({
        where:{
            userId
        },
        order:[['createdAt','DESC']]
    });

    const notificationsList = notifications.map(notification=>({
        id:notification.id,
        title:notification.title,
        message:notification.message,
        isRead:notification.isRead,
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

    return notificationsList;
}

const getUnreadNotificationCount = async(userId)=>{

    if(!userId){
        throw new Error('inputs missing');
    }

    const check = await User.findByPk(userId);

    if(!check){
        throw new Error('invalid user');
    }

    return await Notification.count({
        where:{
            userId,
            isRead:false
        }
    });
}

const sendNotificationToUser = async (
    userId,
    title,
    body
) => {

    if (!userId || !title || !body) {
        throw new Error("inputs missing");
    }

    const device = await UserDevice.findOne({
        where: {
            userId,
            isActive: true
        }
    });

    if (!device) {
        return;
    }

    const response = await admin.messaging().send({
        token: device.fcmToken,
        notification: {
            title,
            body
        }
    });

    console.log(response);
};

// const sendNotificationToUser = async(userId,title,body)=>{

//     if(!userId || !title || !body){
//         throw new Error('inputs missing');
//     }

//     const devices = await UserDevice.findAll({
//         where:{
//             userId,
//             isActive:true
//         }
//     });

//     if(!devices.length){
//         return;
//     }

//     const tokens =
//         devices.map(
//             device =>
//             device.fcmToken
//         );
    
//     const responses =
//         await Promise.allSettled(
//             tokens.map(token =>
//                 admin
//                 .messaging()
//                 .send({
//                     token,
//                     notification:{
//                         title,
//                         body
//                     }
//                 })
//             )
//         );
// }

const markNotificationRead=async(userId)=>{
    if(!userId){
        throw new Error('inputs missing');
    }

    const check = await User.findByPk(userId);

    if(!check){
        throw new Error('invalid user');
    }

    await Notification.update(
        {
            isRead: true
        },
        {
            where: {
                userId,
                isRead: false
            }
        }
    );
}
module.exports = {
    saveFcmToken,
    createNotification,
    getNotifications,
    getUnreadNotificationCount,
    sendNotificationToUser,
    markNotificationRead
}