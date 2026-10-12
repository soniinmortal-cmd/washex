const User = require('../models').User;
const crypto = require('crypto');
const { getUniversityIdByName } = require('./university.service');
const { Op } = require('sequelize');
const { Order, Catalog, Defect, LoggedOutUser, UserLimitPackage, OrderItem, LimitPackage, Issue, OrganizationFreeLimit } = require('../models');
const Organization = require('../models/index').Organization;
const logOutService = require('../services/loggedOutUser.service');
const easeBuzzService = require('../services/easeBuzz.service');
const { NonWashable } = require('../models/nonWashable.model');
const notificationService = require('./notification.service');
const TEST_MOBILE="8745807934";
const TEST_OTP = "123456";
const TEST_MOBILE_2="9865327845";
const TEST_OTP_2 = "021548";
const razorpayService = require('../services/razorPay.service');



const RegisterUser=async(universityId,studentId,name,mobileNumber,laundryNumber)=>{

    if(!universityId || !studentId || !name || !mobileNumber || !laundryNumber){
        throw new error("All Inputs required");
    }

    const existingUser = await User.findOne({
        where:{
            studentId:studentId,
            status : 'enable'
        }
    });

    if(existingUser){
        throw new Error("User already Exists with given studentId");
    }

    const existingUserMobile = await User.findOne({
        where:{
            mobileNumber:mobileNumber,
            status : 'enable'
        }
    });

    if(existingUserMobile){
        throw new Error("User already Exists with given mobileNumber");
    }

    const existingUserLaundry = await User.findOne({
        where:{
            laundryNumber:laundryNumber,
            status : 'enable'
        }
    });

    if(existingUserLaundry){
        throw new Error("User already Exists with given laundryNumber");
    }

    const disabledUser = await User.findOne({
        where: {
        mobileNumber,
        status: "disable",
        },
    });

    let user;

    if (disabledUser) {
        await disabledUser.update({
        organizationId: universityId,
        organizationType: "UNIVERSITY",
        name,
        mobileNumber,
        laundryNumber,
        oneTimePassword: null,
        status: "enable",
        });

        user = disabledUser;
    } else {
        user = await User.create({
        organizationId: universityId,
        organizationType: "UNIVERSITY",
        studentId,
        name,
        mobileNumber,
        laundryNumber,
        oneTimePassword: null,
        });
    }


    const formatted=user.toJSON();
    delete formatted.createdAt;
    delete formatted.oneTimePassword;
    
    const formattedData = {
        id: formatted.id,
        universityId: formatted.organizationId,
        studentId: formatted.studentId,
        name: formatted.name,
        mobileNumber: formatted.mobileNumber,
        laundryNumber: formatted.laundryNumber
    };

    return formattedData;
};

const generateAndSaveOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    if (mobileNumber === TEST_MOBILE) {
        await User.update(
            { status: "enable" },
            {
                where: {
                    mobileNumber,
                    status: "disable"
                }
            }
        );
    }

    const otp =
    mobileNumber === TEST_MOBILE
        ? TEST_OTP
        : mobileNumber === TEST_MOBILE_2
        ? TEST_OTP_2
        : crypto.randomInt(100000, 1000000).toString();

    // const user = await User.findOne({
    //     where:{
    //         mobileNumber : mobileNumber,
    //         status:'enable'
    //     }
    // });

    // if(!user){
    //     throw new Error("User with given mobile number does not exist");
    // }

    // await User.update({
    //     oneTimePassword:otp
    // },{
    //     where:{mobileNumber}
    // });

    if (mobileNumber !== TEST_MOBILE_2) {
        const user = await User.findOne({
            where: {
                mobileNumber,
                status: 'enable'
            }
        });

        if (!user) {
            throw new Error("User with given mobile number does not exist");
        }

        await User.update(
            {
                oneTimePassword: otp
            },
            {
                where: { mobileNumber }
            }
        );
    }

    return otp;
};

const getUserOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    const actualOtp=await User.findOne({
        where:{
            mobileNumber,
            status:'enable'
        },
        include: [{
            model: Organization,
            required: true,
            where: {
                isActive: true
            }
        }]
    });

    console.log(actualOtp);

    if(!actualOtp){
        throw new Error("user not found");
    }

    return mobileNumber ? actualOtp.oneTimePassword : null;
}

const deleteUserOtp=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    await User.update({
        oneTimePassword:null
    },{
        where:{mobileNumber}
    });

    return "OTP deleted successfully";
}

const getUserDetailsByMobile=async(mobileNumber)=>{

    if(!mobileNumber){
        throw new Error("mobile number required");
    }

    const userDetails=await User.findOne({
        where:{mobileNumber},
        attributes:{exclude:['oneTimePassword']}
    });

    if(!userDetails){
        throw new Error("User not found");
    }

    return userDetails;
}

const updateUserDetails=async(data)=>{

    const updatedField={};

    if(data.name){
        updatedField.name=data.name
    }
    if(data.studentId){
        updatedField.studentId=data.studentId
    }
    if(data.mobileNumber){
        updatedField.mobileNumber=data.mobileNumber
    }
    if (data.laundryNumber){
        updatedField.laundryNumber=data.laundryNumber
    }
    if(data.universityName !== undefined){
        throw new Error("university can not be updated")
    }
    if(data.image){
        updatedField.image=data.image
    }

    const user = await User.findOne({
        where:{
            id:data.userId
        }
    });

    if(!user){
        throw new Error("User not found");
    }

    const updatedUser=await User.update(updatedField,{
        where:{
            id:data.userId
        }
    })

    return "Profile updated Succesfully";
};

const getAllUsers = async({organizationId,organizationType="UNIVERSITY",protocol,host}={})=>{

    const whereCondition = {};


    if (organizationId && organizationType) {
        whereCondition.organizationId = organizationId;
        whereCondition.organizationType = organizationType;
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const users = await User.findAll({
        where:whereCondition,
        attributes:{
            exclude : ['oneTimePassword']
        },
        include:[{
            model : Organization,
            attributes : ['name','type']
        },{
            model : UserLimitPackage,
            required:false,
            where:{
                paymentStatus:"SUCCESS",
                expiresAt:{
                    [Op.gt]:new Date()
                }
            },
            attributes:['id'],
            include:[{
                model:LimitPackage,
                attributes:['name']
            }]
        }],
        order:[['createdAt','DESC']]
    });


    const formattedUsers = users.map(user=>{

        const date = new Date(user.createdAt);

        const onlyDate = date.toLocaleDateString('en-GB',{
            timeZone: 'Asia/Kolkata',
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime= date.toLocaleTimeString('en-US',{
            timeZone: 'Asia/Kolkata',
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            userId : user.id,
            universityId : user.organizationId,
            universityName : user.Organization.name,
            studentId : user.studentId,
            name : user.name,
            image : user.image?(baseUrl+user.image):null,
            mobileNumber : user.mobileNumber,
            laundryNumber : user.laundryNumber,
            registrationDate : onlyDate,
            registrationTime : onlyTime,
            status : user.status,
            activePackages:  user.UserLimitPackages
                .map(pkg => pkg.LimitPackage.name)
                .join(", ")
        }
    });

    return {
        users:formattedUsers
    }
}

const getUserInfo = async(userId,protocol,host)=>{

    if(!userId){
        throw new Error("UserId required");
    }

    const user = await User.findOne({
        where:{
            id : userId
        },
        attributes:{
            exclude:['oneTimePassword','createdAt']
        },
        include: [{
            model: Organization,
            attributes: ['name'],
            include: [{
                model: OrganizationFreeLimit,
                attributes: ['monthlyFreeLimit']
            }]
        }]
    });


    if(!user){
        throw new Error("Incorrect UserId");
    }

    const remainingLimit = await getRemainingLimit(userId);
    console.log("reached");
    const totalFreeLaundryLimit =
        user.Organization.OrganizationFreeLimit?.monthlyFreeLimit || 0;

    const formattedBaseUrl = `${protocol}://${host}/uploads/`;

    const count = await notificationService.getUnreadNotificationCount(userId);

    const data = {
        id : user.id,
        universityId : user.organizationId,
        studentId : user.studentId,
        name : user.name,
        mobileNumber : user.mobileNumber,
        laundryNumber : user.laundryNumber,
        University: {
            name : user.Organization.name
        },
        image : formattedBaseUrl + user.image || null,
        remainingLimit:remainingLimit,
        totalFreeLaundryLimit:totalFreeLaundryLimit,
        notificationCount:count
    }

    return data;
}

const getDefectedHistory = async(userId,status,protocol,host)=>{

    if(!userId){
        throw new Error("user id required");
    }

    if(typeof userId !== 'number'){
        throw new Error("incorrect type of user id");
    }

    if(status!=='approved' && status !=='denied'){
        throw new Error("incorrect status");
    }

    const decision = status.trim().toUpperCase();

    const list = await Defect.findAll({
        where:{
            decision : decision
        },
        include:[{
            model : Order,
            where : {
                userId : userId
            },
            attributes : ['createdAt']
        },{
            model : Catalog,
            attributes:['name']
        }],
        order:[['createdAt','DESC']]
    });

    const baseUrl = `${protocol}://${host}/uploads/`

    const formattedList=list.map(item=>{

        const onlyDate = item.Order.createdAt.toLocaleDateString('en-GB',{
            timeZone: 'Asia/Kolkata',
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime = item.Order.createdAt.toLocaleTimeString('en-US',{
            timeZone: 'Asia/Kolkata',
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            date : onlyDate,
            time : onlyTime,
            productName : item.Catalog.name,
            description : item.issueDescription,
            image : baseUrl + item.image,
            orderId : item.orderId
        }
    });

    return formattedList;

}


const getNonWashable = async(userId)=>{

    if(!userId){
        throw new Error("user id required");
    }

    if(typeof userId !== 'number'){
        throw new Error("incorrect type of user id");
    }

    const list = await NonWashable.findAll({

        include:[{
            model : Order,
            where : {
                userId : userId
            },
            attributes : ['createdAt', 'userId'],
			 include: [
                    {
                        model: User, 
                        attributes: ['laundryNumber']
                    }
                ]
        },{
            model : Catalog,
            attributes:['name']
        }],
        order:[['createdAt','DESC']]
    });

    const formattedList=list.map(item=>{

        const onlyDate = item.Order.createdAt.toLocaleDateString('en-GB',{
            timeZone: 'Asia/Kolkata',
            day : '2-digit',
            month : 'short',
            year : 'numeric'
        });

        const onlyTime = item.Order.createdAt.toLocaleTimeString('en-US',{
            timeZone: 'Asia/Kolkata',
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });
		
		 

        return {
            date : onlyDate,
            time : onlyTime,
			orderId : item.orderId,
			laundryNumber: item.Order.User.laundryNumber,
            productName : item.Catalog.name,
            description : item.issueDescription,
            status : item.status
        }
    });

    return formattedList;

}

const logoutUI=async(userId)=>{

    if(!userId){
        throw new Error("user id required");
    }

    const user = await User.findOne({
        where : {
            id : userId
        }
    });

    if(!user){
        throw new Error("user does not exist");
    }

    const data = logOutService.loggedOut(userId);

    return 'user logged out successfully';
}

const getRemainingLimit = async (userId) => {

    if (!userId) {
        throw new Error("user id required");
    }

    const user = await User.findOne({
        where: {
            id: userId
        },
        include: [{
            model: Organization,
            attributes: ["id"],
            include: [{
                model: OrganizationFreeLimit,
                attributes: ["monthlyFreeLimit"]
            }]
        }]
    });

    if (!user) {
        throw new Error("User not found");
    }

    await refreshMonthlyPackages(userId);

    const activePackages = await UserLimitPackage.findAll({
        where: {
            userId,
            paymentStatus: "SUCCESS",
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        attributes: ["remainingLimit"]
    });

    let packageRemainingLimit = 0;

    activePackages.forEach(pkg => {
        packageRemainingLimit += pkg.remainingLimit;
    });

    const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const orders = await Order.findAll({
        where: {
            userId,
            serviceType: "laundry",
            createdAt: {
                [Op.gte]: monthStart
            }
        },
        include: [{
            model: OrderItem,
            attributes: ["quantity"]
        }]
    });

    let usedLimit = 0;

    orders.forEach(order => {
        order.OrderItems.forEach(item => {
            usedLimit += item.quantity;
        });
    });

    const organizationLimit =
        user.Organization.OrganizationFreeLimit?.monthlyFreeLimit || 0;

    const organizationRemaining =
        Math.max(organizationLimit - usedLimit, 0);

    return organizationRemaining + packageRemainingLimit;
};

const getRemainingLimitExcludingOrder = async (userId, orderId) => {

    if (!userId) {
        throw new Error("user id required");
    }

    if (!orderId) {
        throw new Error("order id required");
    }

    const user = await User.findOne({
        where: {
            id: userId
        },
        include: [{
            model: Organization,
            attributes: ["id"],
            include: [{
                model: OrganizationFreeLimit,
                attributes: ["monthlyFreeLimit"]
            }]
        }]
    });

    if (!user) {
        throw new Error("invalid user id");
    }

    await refreshMonthlyPackages(userId);

    const activePackages = await UserLimitPackage.findAll({
        where: {
            userId,
            paymentStatus: "SUCCESS",
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        attributes: ["remainingLimit"]
    });

    const packageRemainingLimit = activePackages.reduce(
        (sum, pkg) => sum + pkg.remainingLimit,
        0
    );

    const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const orders = await Order.findAll({
        where: {
            userId,
            serviceType: "laundry",
            createdAt: {
                [Op.gte]: monthStart
            },
            id: {
                [Op.ne]: orderId
            }
        },
        include: [{
            model: OrderItem,
            attributes: ["quantity"]
        }]
    });

    let usedLimit = 0;

    orders.forEach(order => {
        order.OrderItems.forEach(item => {
            usedLimit += item.quantity;
        });
    });

    const organizationLimit =
        user.Organization.OrganizationFreeLimit?.monthlyFreeLimit || 0;

    const organizationRemaining =
        Math.max(organizationLimit - usedLimit, 0);

    return organizationRemaining + packageRemainingLimit;
};

const getPackages = async (userId) => {

    if (!userId) {
        throw new Error("userId required");
    }

    await refreshMonthlyPackages(userId);

    const user = await User.findByPk(userId);

    const packages = await LimitPackage.findAll({
        where: {
            organizationId: user.organizationId,
            status: "active"
        }
    });

    const userPackages = await UserLimitPackage.findAll({
        where: {
            userId,
            paymentStatus: "SUCCESS",
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        attributes: ["packageId"]
    });

    const activePackageIds = new Set(
        userPackages.map(pkg => pkg.packageId)
    );

    const formattedPackages = packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        extraLimit: pkg.extraLimit,
        price: pkg.price,
        validityDays: pkg.validityDays,
        distributionType: pkg.distributionType,
        userStatus: activePackageIds.has(pkg.id)
            ? "ACTIVE"
            : "INACTIVE"
    }));

    return formattedPackages;
};

const purchasePackage=async(userId,packageId)=>{

    if(!userId || !packageId){
        throw new Error("incorrect input");
    }

    const user = await User.findOne({
        where : {
            id:userId,
            status:'enable'
        }
    })

    if(!user){
        throw new Error("incorrect details");
    }

    const selectedPackage = await LimitPackage.findOne({
        where : {
            id:packageId,
            status:'active'
        }
    });

    if(!selectedPackage){
        throw new Error("incorrect details");
    }

    const currentReleaseMonth =
        (new Date().getFullYear() * 100) +
        (new Date().getMonth() + 1);

    let remainingLimit = selectedPackage.extraLimit;

    if (selectedPackage.distributionType === "MONTHLY") {
        let totalMonths = 1;

        if (selectedPackage.validityDays >= 365) {
            totalMonths = 12;
        } else if (selectedPackage.validityDays >= 180) {
            totalMonths = 6;
        } else if (selectedPackage.validityDays >= 90) {
            totalMonths = 3;
        }

        remainingLimit = Math.floor(
            selectedPackage.extraLimit / totalMonths
        );
    }

    const order = await UserLimitPackage.create({
        userId,
        packageId,
        extraLimit: selectedPackage.extraLimit,
        remainingLimit,
        currentReleaseMonth,
        expiresAt: null
    });
    // const txnid = `QW_${order.id}_${Date.now()}`;
    // await order.update({
    //     transactionToken:txnid
    // })

    // const gatewayResponse = await easeBuzzService.createPaymentSessionpackages({
    //     orderId:order.id,
    //     amount:selectedPackage.price,
    //     name:user.name,
    //     phone:user.mobileNumber,
    //     txnid:txnid
    // });

    const gatewayResponse =
        await razorpayService.createPaymentOrder({
            orderId: order.id,
            amount: selectedPackage.price
        });

    await order.update({
        transactionToken:
            gatewayResponse.razorpayOrderId
    });

    return {
        razorpayOrderId:
            gatewayResponse.razorpayOrderId,
        amount:
            gatewayResponse.amount,
        currency:
            gatewayResponse.currency,
        key:
            process.env.RAZORPAY_KEY_ID,
        orderId:order.id
    };

    // const accessKey = gatewayResponse.accessKey;

    // return accessKey;

}

const getRemainingOrganizationLimit = async (userId) => {

    if (!userId) {
        throw new Error("user id required");
    }

    const user = await User.findOne({
        where: {
            id: userId
        },
        include: [{
            model: Organization,
            attributes: ["id"],
            include: [{
                model: OrganizationFreeLimit,
                attributes: ["monthlyFreeLimit"]
            }]
        }]
    });

    if (!user) {
        throw new Error("invalid user id");
    }

    const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const orders = await Order.findAll({
        where: {
            userId,
            serviceType: "laundry",
            createdAt: {
                [Op.gte]: monthStart
            }
        },
        include: [{
            model: OrderItem,
            attributes: ["quantity"]
        }]
    });

    let usedLimit = 0;

    orders.forEach(order => {
        order.OrderItems.forEach(item => {
            usedLimit += item.quantity;
        });
    });

    const organizationLimit =
        user.Organization.OrganizationFreeLimit?.monthlyFreeLimit || 0;

    return Math.max(
        organizationLimit - usedLimit,
        0
    );
};

const consumePackageLimit = async (
    userId,
    quantity,
    transaction
) => {

    if (quantity <= 0) {
        return;
    }

    const packages =
        await UserLimitPackage.findAll({
            where: {
                userId,
                paymentStatus: "SUCCESS",
                expiresAt: {
                    [Op.gt]: new Date()
                },
                remainingLimit: {
                    [Op.gt]: 0
                }
            },
            order: [
                ["createdAt", "ASC"]
            ],
            transaction
        });

    let remainingQuantity = quantity;

    for (const pkg of packages) {

        if (remainingQuantity <= 0) {
            break;
        }

        const consume = Math.min(
            pkg.remainingLimit,
            remainingQuantity
        );

        await pkg.update(
            {
                remainingLimit:
                    pkg.remainingLimit - consume
            },
            {
                transaction
            }
        );

        remainingQuantity -= consume;
    }

    if (remainingQuantity > 0) {
        throw new Error(
            "Package limit mismatch"
        );
    }
};

const getRemainingOrganizationLimitExcludingOrder = async (userId, orderId) => {

    if (!userId) {
        throw new Error("user id required");
    }

    if (!orderId) {
        throw new Error("order id required");
    }

    const user = await User.findOne({
        where: {
            id: userId
        },
        include: [{
            model: Organization,
            attributes: ["id"],
            include: [{
                model: OrganizationFreeLimit,
                attributes: ["monthlyFreeLimit"]
            }]
        }]
    });

    if (!user) {
        throw new Error("invalid user id");
    }

    const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const orders = await Order.findAll({
        where: {
            userId,
            serviceType: "laundry",
            createdAt: {
                [Op.gte]: monthStart
            },
            id: {
                [Op.ne]: orderId
            }
        },
        include: [{
            model: OrderItem,
            attributes: ["quantity"]
        }]
    });

    let usedLimit = 0;

    orders.forEach(order => {
        order.OrderItems.forEach(item => {
            usedLimit += item.quantity;
        });
    });

    const organizationLimit =
        user.Organization.OrganizationFreeLimit?.monthlyFreeLimit || 0;

    return Math.max(
        organizationLimit - usedLimit,
        0
    );
};

const refreshMonthlyPackages = async (userId) => {

    if (!userId) {
        throw new Error("user id required");
    }

    const currentReleaseMonth =
        (new Date().getFullYear() * 100) +
        (new Date().getMonth() + 1);

    const activePackages = await UserLimitPackage.findAll({
        where: {
            userId,
            paymentStatus: "SUCCESS",
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        include: [{
            model: LimitPackage,
            attributes: [
                "distributionType",
                "validityDays"
            ]
        }]
    });

    for (const pkg of activePackages) {

        if (
            pkg.LimitPackage.distributionType !== "MONTHLY"
        ) {
            continue;
        }

        if (
            pkg.currentReleaseMonth >= currentReleaseMonth
        ) {
            continue;
        }

        let totalMonths = 1;

        if (pkg.LimitPackage.validityDays >= 365) {
            totalMonths = 12;
        } else if (pkg.LimitPackage.validityDays >= 180) {
            totalMonths = 6;
        } else if (pkg.LimitPackage.validityDays >= 90) {
            totalMonths = 3;
        }

        pkg.remainingLimit = Math.floor(
            pkg.extraLimit / totalMonths
        );

        pkg.currentReleaseMonth =
            currentReleaseMonth;

        await pkg.save();
    }
};

const restorePackageLimit = async (
    userId,
    quantity,
    transaction
) => {

    if (quantity <= 0) {
        return;
    }

    const packages = await UserLimitPackage.findAll({
        where: {
            userId,
            paymentStatus: "SUCCESS",
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        include: [{
            model: LimitPackage,
            attributes: ["distributionType"]
        }],
        order: [
            ["createdAt", "DESC"]
        ],
        transaction
    });

    let remainingQuantity = quantity;

    for (const pkg of packages) {

        if (remainingQuantity <= 0) {
            break;
        }

        let maxLimit = pkg.extraLimit;

        if (pkg.LimitPackage.distributionType === "MONTHLY") {
            maxLimit = Math.floor(
                pkg.extraLimit / 12
            );
        }

        const availableRestore =
            maxLimit - pkg.remainingLimit;

        if (availableRestore <= 0) {
            continue;
        }

        const restore = Math.min(
            availableRestore,
            remainingQuantity
        );

        pkg.remainingLimit += restore;

        await pkg.save({
            transaction
        });

        remainingQuantity -= restore;
    }

    if (remainingQuantity > 0) {
        throw new Error(
            "Package restore mismatch"
        );
    }
};

module.exports={
    restorePackageLimit,
    refreshMonthlyPackages,
    getRemainingOrganizationLimitExcludingOrder,
    getRemainingOrganizationLimit,
    consumePackageLimit,
    getRemainingLimitExcludingOrder,
    RegisterUser,
    generateAndSaveOtp,
    getUserOtp,
    deleteUserOtp,
    getUserDetailsByMobile,
    updateUserDetails,
    getAllUsers,
    getUserInfo,
    getDefectedHistory,
    logoutUI,
    getRemainingLimit,
    getPackages,
    purchasePackage,
	getNonWashable
};