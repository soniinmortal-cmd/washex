const { LoggedOutUser, User, Organization } = require("../models");
const { loggedOut } = require("../services/loggedOutUser.service");

const loginMiddleware = async(req,res,next)=>{

    try{
        console.log('reached midlleware');
        const userId = req.body.userId;
        const sessionId = req.body?.sessionId;


        if(!userId){
            return res.status(201).json({
                message : "user id required",
                status : "false"
            })
        }

        const loggedOut = await LoggedOutUser.findOne({
            where:{
                userId : userId
            }
        });

        if(loggedOut){
            if(loggedOut.isLoggedOut === '0'){
                return res.status(201).json({
                    message : "log in required",
                    status : "false"
                })
            }

        }

        const user = await User.findByPk(userId, {
            attributes: ['id', 'status'],
            include: [{
                model: Organization,
                attributes: ['isActive']
            },{
                model:LoggedOutUser,
                attributes:['sessionId']
            }]
        });

        if (!user) {
            return res.status(201).json({
                message: "user not found",
                status: "false"
            });
        }

        if (user.status === 'disable') {
            return res.status(201).json({
                message: "user disabled",
                status: "false"
            });
        }

        if (user.Organization && !user.Organization.isActive) {
            return res.status(201).json({
                message: "Something Went Wrong",
                status: "false"
            });
        }

        if(sessionId){
            if(sessionId!==loggedOut.sessionId){
                return res.status(201).json({
                    message:"Invalid session",
                    status : "false"
                })
            }
        }


        next();

    }catch(error){
        console.log("middleware threw error");
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}

module.exports = {
    loginMiddleware
}