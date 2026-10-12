const userService = require('../services/user.service');
const universityService = require('../services/university.service');
const orderstatusService = require('../services/orderStatus.service');
const issueService = require('../services/issue.service');
const logOutService = require('../services/loggedOutUser.service');
const { User, UserLimitPackage, LimitPackage, Payment, Orderstatus, Order } = require('../models');
const orderService = require('../services/order.service');
const AppImagesService = require('../services/appImages.service');
const { paymentStatus } = require('./order.controller');
const TEST_MOBILE="8745807934";
const TEST_OTP = "123456";
const TEST_MOBILE_2="9865327845";
const TEST_OTP_2 = "021548";
const whatsappService = require('../services/whatsapp.service');


const deleteAccountTwo = async (req, res) => {
    try {
        const mobileNumber = TEST_MOBILE_2;

        if (!mobileNumber) {
            return res.status(400).json({
                status: false,
                message: "Mobile number required"
            });
        }

        const user = await User.findOne({
            where: {
                mobileNumber,
                status: "enable"
            }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }


        await User.update(
            {
                status: "disable"
            },
            {
                where: {
                    mobileNumber
                }
            }
        );

        return res.status(200).json({
            status: true,
            message: "Account deleted successfully."
        });

    } catch (err) {
        return res.status(200).json({
            status: false,
            message: err.message
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const mobileNumber = TEST_MOBILE;

        if (!mobileNumber) {
            return res.status(400).json({
                status: false,
                message: "Mobile number required"
            });
        }

        const user = await User.findOne({
            where: {
                mobileNumber,
                status: "enable"
            }
        });

        if (!user) {
            return res.status(201).json({
                status: false,
                message: "User not found"
            });
        }


        await User.update(
            {
                status: "disable"
            },
            {
                where: {
                    mobileNumber
                }
            }
        );

        return res.status(200).json({
            status: true,
            message: "Account deleted successfully."
        });

    } catch (err) {
        return res.status(200).json({
            status: false,
            message: err.message
        });
    }
};

const register=async(req,res)=>{
    try{
        const universityId = await universityService.getUniversityIdByName(req.body.universityName);

        const newUser=await userService.RegisterUser(
            universityId,
            req.body.studentId,
            req.body.name,
            req.body.mobileNumber,
            req.body.laundryNumber
        );

        res.status(201).json({
            message:'User registered successfully',
            status:"true",
            data:newUser
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }
};

const sendOtp=async(req,res)=>{
    try{
        const mobileNumber=req.body.mobileNumber;

        if(!mobileNumber){
            return res.status(201).json({
                message:'Mobile number is required',
                status:"false"
            });
        }

        const otp = await userService.generateAndSaveOtp(mobileNumber);

        //Todo:send-otp logic here
        console.log("whatsapp service called");
        await whatsappService.sendSmsOtp(mobileNumber,otp);
        console.log("whatsapp service finished");

        res.status(200).json({
            message:'OTP sent successfully',
            status:"true",
            otp:otp
        });
    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
};

const verifyOtp=async(req,res)=>{
    try{
        console.log(req.body);
        console.log("reached");
        const mobileNumber=req.body.mobileNumber;
        console.log("reached2");
        const userOtp=req.body.otp;

        const actualOtp=await userService.getUserOtp(mobileNumber);
        console.log("reached");
        const isValidOtp =
            (mobileNumber === TEST_MOBILE && userOtp === TEST_OTP) ||
            (mobileNumber === TEST_MOBILE_2 && userOtp === TEST_OTP_2) ||
            (userOtp === actualOtp);

        if(isValidOtp){
            const data = await userService.getUserDetailsByMobile(mobileNumber);

            const formattedData = data.toJSON();
            delete formattedData.createdAt;

            await userService.deleteUserOtp(mobileNumber);

            const user = await User.findOne({
                where : {
                    mobileNumber
                }
            })

            const returnformattedData = {
                id: formattedData.id,
                universityId: formattedData.organizationId,
                studentId: formattedData.studentId,
                name: formattedData.name,
                mobileNumber: formattedData.mobileNumber,
                laundryNumber: formattedData.laundryNumber
            };

            const sessionId = await logOutService.loggedIn(user.id);

            res.status(200).json({
                message:'OTP verified successfully',
                status:"true",
                formattedData : returnformattedData,
                sessionId:sessionId
            });
        }else{
            res.status(201).json({
                message:'Invalid OTP',
                status:"false"
            });
        }

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const resendOtp=async(req,res)=>{
    try{
        const mobileNumber=req.body.mobileNumber;

        if(!mobileNumber){
            return res.status(201).json({
                message:'Mobile number is required'
            });
        }

        const otp =await userService.generateAndSaveOtp(mobileNumber);

        await whatsappService.sendSmsOtp(mobileNumber,otp);

        res.status(200).json({
            message:'OTP resent successfully',
            status:'true',
            otp : otp
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const updateUserDetails=async(req,res)=>{

    try{
        if(!req.body.userId){
            return res.status(400).json({
                message:'userId missing'
            })
        }

        if(!req.body.name && !req.body.studentId && !req.body.universityName && !req.body.mobileNumber && !req.body.laundryNumber){
            return res.status(400).json({
                message:"no input recieved"
            })
        }

        if(req.file){
            const image = req.file.filename;
            req.body.image = image;
        }

        const updatedUser = await userService.updateUserDetails(req.body);
        return res.status(200).json({
            message:updatedUser,
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const getOrderStatus=async(req,res)=>{

    try{

        const userId = req.body.userId;
        const orderId = req.body.orderId;

        if(!userId || !orderId){
            return res.status(400).json({
                message:"inputs missing"
            });
        }

        const status = await orderstatusService.getOrderStatus(userId,orderId);

        return res.status(200).json({
            message:"status fetched succesfully",
            status:"true",
            data:status
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
};

const getUserInfo = async(req,res)=>{

    try{
        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }
        const protocol = req.protocol;
        const host = req.get('host');

        const data = await userService.getUserInfo(userId,protocol,host);

        return res.status(200).json({
            message : "Details fetched successfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}

const getDefectedHistory=async(req,res)=>{
    try{
        const userId = req.body.userId;
        const status = req.body.status;
        const protocol=req.protocol;
        const host = req.get('host');
        const normalizedstatus = status.trim().toLowerCase();

        const data = await userService.getDefectedHistory(userId,normalizedstatus,protocol,host);
        return res.status(200).json({
            message : "data fetched succesfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const getNonWashable=async(req,res)=>{
    try{
        const userId = req.body.userId;
       

        const data = await userService.getNonWashable(userId);
        return res.status(200).json({
            message : "data fetched succesfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}



const addIssue = async(req,res)=>{
    try{
        const {orderId,items,userId} =req.body;
        const submittedByType = 'USER';

        await issueService.addIssue(orderId,items,submittedByType,userId);

        return res.status(200).json({
            message : "issue raised successfully",
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        })
    }
}


const issueDetails=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const userId = req.body.userId;

        const protocol = req.protocol;

        const host = req.get('host');

        const data = await issueService.issueDetailsUser(orderId,userId,protocol,host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const logoutUI=async(req,res)=>{

    try{

        const userId = req.body.userId;
        const message = await userService.logoutUI(userId);
        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){  
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}



const orderConfirmation = async(req,res)=>{

    try{
        const orderId = Number(req.body.orderId);

        const data = await orderService.orderConfirmation(orderId);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        })
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }

}

const fetchAllImages=async(req,res)=>{

    try{

        const protocol = req.protocol;
        const host = req.get('host');

        const images = await AppImagesService.fetchAllImages(protocol,host);

        return res.status(200).json({
            message : "images fetched successfully",
            status : "true",
            data : images
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }

}

const getPackages=async(req,res)=>{

    try{
        const userId = req.body?.userId ?? 3;
        const data = await userService.getPackages(userId);

        return res.status(200).json({
            message : "packages fetched successfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        })
    }
}

const purchasePackage = async(req,res)=>{
    //TODO:change needed

    try{

        const userId = req.body.userId;
        const packageId = req.body.packageId;

        const accesToken = await userService.purchasePackage(userId,packageId);

        return res.status(200).json({
            message : "purchase has begun",
            status : "true",
            accesToken
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const paymentPackage = async(req,res)=>{

    try{
        const{txnid,status,mode}=req.body;

        if(status.toLowerCase()==='success'){
            const selectedPackage = await UserLimitPackage.findOne({
                where:{
                    transactionToken:txnid
                }
            })

            const days = await LimitPackage.findOne({where : {
                id:selectedPackage.packageId
            }})
            const expiry = new Date();
            expiry.setDate(expiry.getDate()+days.validityDays);
            await selectedPackage.update({
                paymentStatus:'SUCCESS',
                expiresAt:expiry
            })
        }else{
            await UserLimitPackage.update({
                paymentStatus:'FAILED'
            },{
                where : {
                    transactionToken:txnid
                }
            })
        }

        return res.status(200).send("OK");

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const getItemsInOrder=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const data = await orderService.getItemsInOrder(orderId);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const issueHistory=async(req,res)=>{

    try{

        const id = req.body.userId;

        const data = await issueService.issueHistory(id,"USER");

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const crypto = require("crypto");
const { buildReceiptPayload } = require('../config/buildReceiptPayload');
const generateAndSaveReceipt = require('../config/generateReceipt');

const paymentCallback = async (req, res) => {
    try {

        console.log("RAZORPAY CALLBACK");
        console.log(req.body);

        const {
            orderId,
            status,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            reason
        } = req.body;

        const payment = await Payment.findOne({
            where: {
                orderId
            }
        });
        console.log("Payment found:", payment?.toJSON());
console.log("Status:", payment?.status);
console.log("OrderId received:", orderId);

        if (!payment) {
            return res.status(404).send("Payment not found");
        }
        console.log(
    payment.status === "SUCCESS",
    payment.status === "FAILED"
);

        // Idempotency
        if (
            payment.status === "SUCCESS" ||
            payment.status === "FAILED"
        ) {
            return res.send("Already processed");
        }

        /*
        -------------------------
        PAYMENT FAILED
        -------------------------
        */

        if (status === "FAILED") {

            await payment.update({
                status: "FAILED"
            });

            const order = await Order.findByPk(orderId);

            await Orderstatus.create({
                orderId,
                userId: order.userId,
                status: "FAILED"
            });

            return res.status(200).json({
                message: "failed",
                status: "false"
            });
        }

        /*
        -------------------------
        VERIFY SIGNATURE
        -------------------------
        */

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {

            await payment.update({
                status: "FAILED"
            });

            const order = await Order.findByPk(orderId);

            await Orderstatus.create({
                orderId,
                userId: order.userId,
                status: "FAILED"
            });

            return res.status(400).json({
                status: false,
                message: "Invalid Signature"
            });
        }

        /*
        -------------------------
        PAYMENT SUCCESS
        -------------------------
        */

        await payment.update({
            paymentMethod: "ONLINE",
            status: "SUCCESS"
        });

        await orderService.updatePaymentStatusAndGenerateReceipt(
            orderId,
            "ONLINE",
            "SUCCESS"
        );

        const order = await Order.findByPk(orderId);

        const payload =
            await buildReceiptPayload(order);

        generateAndSaveReceipt(payload)
            .catch(err =>
                console.error(
                    "Receipt error:",
                    err
                )
            );

        await orderService.clearCart(
            order.userId,
            order.serviceType
        );

        return res.status(200).json({
            message: "success",
            status: "true"
        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: error.message,
            status: "false"
        });
    }
};

const packagePaymentCallback = async (req, res) => {

    try {

        console.log("PACKAGE CALLBACK");
        console.log(req.body);

        const {
            orderId,
            status,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const selectedPackage = await UserLimitPackage.findByPk(orderId);

        if (!selectedPackage) {
            return res.status(404).send("Package not found");
        }

        if (
            selectedPackage.paymentStatus === "SUCCESS" ||
            selectedPackage.paymentStatus === "FAILED"
        ) {
            return res.send("Already processed");
        }

        /*
        -------------------------
        PAYMENT FAILED
        -------------------------
        */

        if (status === "FAILED") {

            await selectedPackage.update({
                paymentStatus: "FAILED"
            });

            return res.status(200).json({
                message: "failed",
                status: "false"
            });
        }

        /*
        -------------------------
        VERIFY SIGNATURE
        -------------------------
        */

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {

            await selectedPackage.update({
                paymentStatus: "FAILED"
            });

            return res.status(400).json({
                status: false,
                message: "Invalid Signature"
            });
        }

        /*
        -------------------------
        PAYMENT SUCCESS
        -------------------------
        */

        const packageDetails = await LimitPackage.findByPk(
            selectedPackage.packageId
        );

        const expiry = new Date();
        expiry.setDate(
            expiry.getDate() + packageDetails.validityDays
        );

        await selectedPackage.update({
            paymentStatus: "SUCCESS",
            paymentMode: "ONLINE",
            expiresAt: expiry
        });

        return res.status(500).json({
            message: "success",
            status: "true"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: error.message,
            status: "false"
        });
    }
};



module.exports={
    deleteAccountTwo,
    packagePaymentCallback,
    paymentCallback,
    register,
    sendOtp,
    verifyOtp,
    resendOtp,
    updateUserDetails,
    getOrderStatus,
    getUserInfo,
    getDefectedHistory,
    addIssue,
    logoutUI,
    issueHistory,
    orderConfirmation,
    fetchAllImages,
    getPackages,
    purchasePackage,
    paymentPackage,
    getItemsInOrder,
    issueDetails,
	getNonWashable,
    deleteAccount
};