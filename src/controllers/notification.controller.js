const notificationService = require('../services/notification.service');

const saveFcmToken = async(req,res)=>{

    try{
        const userId = req.body.userId;
        const fcmToken = req.body.fcmToken;
        const deviceType = req.body.deviceType;

        const response = await notificationService.saveFcmToken(userId,fcmToken,deviceType);

        return res.status(200).json({
            message : response,
            status:"true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const getNotifications = async (req,res)=>{

    try{
        const userId = req.body.userId;

        const response = await notificationService.getNotifications(userId);

        return res.status(200).json({
            message : "notifications fetched succesfully",
            data:response,
            status:"true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const markNotificationRead=async(req,res)=>{
    try{
        const userId = req.body.userId;

        await notificationService.markNotificationRead(userId);

        return res.status(200).json({
            message : "notifications read",
            status:"true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

module.exports={
    saveFcmToken,
    getNotifications,
    markNotificationRead
}