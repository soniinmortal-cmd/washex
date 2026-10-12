const { OrderItem,Order, Catalog, Defect, Organization, Chemical, ChemicalList, Payment, User, Orderstatus, Washermapper, NonWashable, NonUniversityDefect, NonUniversityNonWashable, NonUniversityMismatch, Issue } = require('../models');
const Sequelize = require('../models/index').sequelize;
const Washer = require('../models').Washer;
const washerMenService = require('./washerMan.service');
const washerAttendanceService = require('./washerAttendance.service');
const organizationService = require('./university.service');
const orderService = require('./order.service');
const { Op } = require('sequelize');
const { PasswordChange } = require('../models/passwordChange.model');
const catalogService = require('../services/catalog.service');
const notificationService = require('./notification.service');
const washerNotificationService = require('./washerNotification.service');
const { LpgReceipts } = require('../models/lpgReceipts.model');

const loginWasher=async(loginId,password)=>{
    const washer = await Washer.findOne({
        where:{
            loginId:loginId,
            isActive: true
        }
    });

    if(!washer){
        throw new Error("Incorrect credentials");
    }

    if(password!=washer.password){
        throw new Error("Incorrect credentials");
    }

    const washerinfo = await Washer.findOne({
        where:{
            id:washer.id
        },
        include:[{
            model:Organization,
            attributes:['name']
        }]
    });

    const formattedWasher={
        id:washerinfo.id,
        name:washerinfo.name,
        loginId:washerinfo.loginId,
        password:washerinfo.password,
        organizationId:washerinfo.organizationId,
        organizationName:washerinfo.Organization.name
    }

    // await washerNotificationService.saveWasherFcmToken(
    //     washer.id,
    //     fcmToken,
    //     deviceType
    // );

    return formattedWasher;
};

const getOrders = async(washerId,filter)=>{

    if(!washerId){
        throw new Error("washer id required");
    }

    if(typeof washerId !== 'number'){
        throw new Error("incorrect type of washer id");
    }

    const washer = await Washer.findOne({
        where : {
            id : washerId
        }
    })

    if(!washer){
        throw new Error("Washer does not exist")
    }

    const parsedFilter = Number(filter);

    if(filter!="null" && filter!=null && ![7,15,30].includes(parsedFilter)){
        throw new Error('invalid filter');
    }

    let allowedDate;
    if([7,15,30].includes(parsedFilter)){
        allowedDate = new Date();
        allowedDate.setDate(allowedDate.getDate()-parsedFilter);
    }

    const where = {
        organizationId: washer.organizationId,
        organizationType: washer.organizationType,
        [Op.and]: Sequelize.literal(`(
            SELECT status
            FROM orderstatus os
            WHERE os.orderId = Order.id
            ORDER BY os.createdAt DESC
            LIMIT 1
        ) IN ('ISSUE','SUBMITTED','COMPLETED')`)
    };

    if (allowedDate) {
        where.createdAt = {
            [Op.gte]: allowedDate
        };
    }

    const orders = await Order.findAll({
        where,
        attributes: {
            include: [
            [
                Sequelize.literal(`(
                SELECT status
                FROM orderstatus os
                WHERE os.orderId = Order.id
                ORDER BY os.createdAt DESC
                LIMIT 1
                )`),
                'latestStatus'
            ]
            ]
        },
        include : [{
            model : OrderItem,
            attributes : ['quantity']
        },{
            model : Payment,
            attributes : [],
            required : true,
            where : {
                [Op.not]: [
                    {
                        paymentMethod: 'ONLINE',
                        status: 'FAILED'
                    }
                ]
            }
        },{
            model:User,
            attributes:['laundryNumber']
        }],
        order : [['createdAt','DESC']]
    });

    if(!orders.length){
        throw new Error("no orders for this washer yet");
    }

    return orders.map(order=>{

        const totalQuantity = order.OrderItems.reduce(
            (sum,item)=>sum+item.quantity,
            0
        );

        const date = new Date(order.createdAt);

        const onlyDate= date.toLocaleDateString('en-GB',{
            timeZone: 'Asia/Kolkata',
            day:'2-digit',
            month:'short',
            year:'numeric'
        });

        const onlyTime= date.toLocaleTimeString('en-US',{
            timeZone: 'Asia/Kolkata',
            hour:'2-digit',
            minute:'2-digit',
            hour12:true
        });

        return {
            orderId : order.id,
            userId : order.userId,
            date : onlyDate,
            time : onlyTime,
            totalQuantity : totalQuantity,
            status : order.get('latestStatus'),
            laundryNumber : order.User.laundryNumber
        }

    })
};

const getOrderDetails = async(washerId,orderId,protocol,host)=>{

    if(!washerId || !orderId){
        throw new Error("washer id / order id required");
    }

    if(typeof washerId !=="number"){
        throw new Error("incorrect type");
    }

    if(typeof orderId !=="number"){
        throw new Error("incorrect type");
    }

    const washer = await Washer.findOne({
        where : {
            id : washerId
        }
    })

    if(!washer){
        throw new Error("Washer does not exist")
    }

    const order = await Order.findOne({
        where : {
            id : orderId,
            organizationId : washer.organizationId,
            organizationType : washer.organizationType
        },
        attributes: {
            include: [
            [
                Sequelize.literal(`(
                SELECT status
                FROM orderstatus os
                WHERE os.orderId = Order.id
                ORDER BY os.createdAt DESC
                LIMIT 1
                )`),
                'latestStatus'
            ],
            [
                Sequelize.literal(`(
                    SELECT SUM(oi.quantity)
                    FROM order_items oi
                    WHERE oi.orderId = Order.id
                )`),
                'totalQuantity'
            ]
            ]
        }
    });

    if(!order){
        throw new Error("incorrect washer id / order id");
    }

    const date = new Date(order.createdAt);

    const onlyDate = date.toLocaleDateString('en-GB',{
        timeZone: 'Asia/Kolkata',
        day:'2-digit',
        month:'short',
        year:'numeric'
    });

    const onlyTime = date.toLocaleTimeString('en-US',{
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    });

    const items = await OrderItem.findAll({
        where : {
            orderId : orderId
        },
        include : {
            model : Catalog,
            attributes : ['name','image']
        }
    });

    let map = new Map();

    for(const item of items){
        console.log("reached 1");
        if(!map.get(item.productId)){
            map.set(item.productId,{
                quantity : 0
            });
        }

        let quantity = map.get(item.productId).quantity;

        quantity+=item.quantity;

        map.set(item.productId,{
            productId:item.productId,
            quantity:quantity,
            name:item.Catalog.name,
            image:item.Catalog.image
        });
    }

    const baseUrl = `${protocol}://${host}/uploads/`

    const formattedItems =  Array.from(map.keys()).map(productId=>{
        return {
            productId : map.get(productId).productId,
            name : map.get(productId).name,
            image : baseUrl + map.get(productId).image,
            quantity : map.get(productId).quantity
        }
    })

        // DEFECTS
    const defectList = await Defect.findAll({
        where: {
            orderId
        },
        include: {
            model: Catalog,
            attributes: ['name']
        }
    });

    const formattedDefectList = defectList.map(item => ({
        defectId: item.id,
        type: "DEFECT",
        productId: item.itemId,

        issueDescription:
            item.Catalog.name +
            ": " +
            item.issueDescription,

        image:
            baseUrl + item.image,

        quantitySubmitted: null,
        quantityReceived: null,

        decision: item.decision
    }));


    // NON WASHABLE
    const nonWashableList = await NonWashable.findAll({
        where: {
            orderId
        },
        include: {
            model: Catalog,
            attributes: ['name', 'image']
        }
    });

    const formattedNonWashableList = nonWashableList.map(item => ({
        defectId: item.id,
        type: "NONWASHABLE",
        productId: item.itemId,

        issueDescription:
            item.Catalog.name +
            ": " +
            item.issueDescription,

        image:
            baseUrl + item.Catalog.image,

        quantitySubmitted: null,
        quantityReceived: null,

        decision: item.status
    }));


    // MISMATCH / ISSUE
    const issueList = await Issue.findAll({
        where: {
            orderId
        },
        include: [
            {
                model: Catalog,
                attributes: ['name', 'image']
            },
            {
                model: Order,
                attributes: ['id'],
                include: [{
                    model: OrderItem,
                    attributes: ['productId', 'quantity']
                }]
            }
        ]
    });

    const formattedIssueList = issueList.map(item => {

        const submittedItem =
            item.Order?.OrderItems?.find(
                orderItem =>
                    orderItem.productId === item.productId
            );

        return {
            defectId: item.id,
            type: "MISMATCH",
            productId: item.productId,

            issueDescription:
                item.Catalog.name,

            image:
                baseUrl + item.Catalog.image,

            quantitySubmitted:
                submittedItem?.quantity || 0,

            quantityReceived:
                item.quantity,

            decision:
                item.status
        };
    });


    const mergedDefects = [
        ...formattedDefectList,
        ...formattedNonWashableList,
        ...formattedIssueList
    ];

    return {
        details : {
            status : order.get('latestStatus'),
            date : onlyDate,
            time : onlyTime,
            orderId : order.id,
            userId : order.userId,
            count : order.get('totalQuantity')
        },
        clothesDetails : formattedItems,
        defectedClothes : mergedDefects
    }

}

const getWashers = async(washerId,Date)=>{

    if(!washerId){
        throw new Error('id required');
    }

    const id = Number(washerId);

    const data = await washerMenService.washerMen(id,Date);

    return data;
}

const setAttendance=async(washerId,date,washers)=>{

    const message = await washerAttendanceService.setAttendance(washerId,date,washers);

    return message;
}

const getAllWasherAdmin=async(protocol,host)=>{

    console.log("reached");
    const list = await Washer.findAll({
        include:[{
            model : Organization,
            key : 'id'
        }],
        order:[['createdAt','DESC']]
    });
    const baseUrl = `${protocol}://${host}/uploads/`;
    const formattedList = list.map(l=>{
        const onlyDate = l.createdAt.toLocaleDateString('en-GB',{
                timeZone: 'Asia/Kolkata',
                day : '2-digit',
                month : 'short',
                year : 'numeric'
            });

            const onlyTime = l.createdAt.toLocaleTimeString('en-US',{
                timeZone: 'Asia/Kolkata',
                hour:'2-digit',
                minute:'2-digit',
                hour12:true
            });
        return {
            id:l.id,
            loginId:l.loginId,
            name:l.name,
            password:l.password,
            image: l.image?( baseUrl+l.image):null,
            organizationName:l.Organization?.name || null,
            isActive:l.isActive,
            date : onlyDate,
            time : onlyTime
        }
    });

    return formattedList;
}

const getListOfUniversities=async(type)=>{

    return await organizationService.getListOfUniversities(type);
}

const getWasherInfo=async(washerId,protocol,host)=>{

    const WasherId = Number(washerId);

    if(!WasherId){
        throw new Error('washer id required');
    }

    const washer = await Washer.findOne({
        where : {
            id : WasherId
        }
    });

    if(!washer){
        throw new Error('washer not found');
    }
	 const baseUrl = `${protocol}://${host}/uploads/`


  

    const formattedWasher = {
        id:washer.id,
        name:washer.name,
        loginId:washer.loginId,
        password:washer.password,
        organizationId:washer.organizationId,
		image : baseUrl + washer.image
    };

    return formattedWasher;
}

const getItemsInOrder=async(orderId)=>{

    if(!orderId){
        throw new Error('order id required');
    }

    const OrderId = Number(orderId);

    const data = await orderService.getItemsInOrder(OrderId);

    return data;
}
const lastChemicalOpening = async (washerId, month, year) => {

    if (!washerId || !month || !year) {
        throw new Error('washerId, month, year required');
    }

    const chemicals = await ChemicalList.findAll({
        attributes: ['id', 'name','price']
    });

    const results = await Promise.all(

        chemicals.map(async (chem) => {


            const existingEntry = await Chemical.findOne({
                where: {
                    washerId,
                    chemicalId: chem.id,
                    month,
                    year
                }
            });
            console.log(chem.price);
            if (existingEntry) {

                return {
                    exists: true,

                    chemicalId: chem.id,
                    name: chem.name,
                    price: chem.price,
                    openingBalance: existingEntry.openingBalance,
                    received: existingEntry.received,
                    consumed: existingEntry.consumed
                };
            }

            const previousData = await Chemical.findOne({
                where: {
                    washerId,
                    chemicalId: chem.id,
                    [Op.or]: [
                        { year: { [Op.lt]: year } },
                        {
                            year,
                            month: { [Op.lt]: month }
                        }
                    ]
                },
                order: [
                    ['year', 'DESC'],
                    ['month', 'DESC']
                ]
            });

            const opening = previousData
                ? Number(previousData.openingBalance)
                    + Number(previousData.received)
                    - Number(previousData.consumed)
                : null;

            return {
                exists: false,

                chemicalId: chem.id,
                name: chem.name,
                price: chem.price,
                openingBalance: opening,
                received: null,
                consumed: null
            };

        })
    );

    return results;
};

const logoutUIWasher=async(washerId)=>{

    if(!washerId){
        throw new Error("washer id required");
    }

    const user = await Washer.findOne({
        where : {
            id : washerId
        }
    });

    if(!user){
        throw new Error("washer does not exist");
    }

    return 'washer logged out successfully';
}


const getDefectedWasherHistory = async(washerId,status,protocol,host)=>{

    if(!washerId){
        throw new Error("user id required");
    }

    if(typeof washerId !== 'number'){
        throw new Error("incorrect type of washer id");
    }

    if(status!=='approved' && status !=='denied' && status!=='pending'){
        throw new Error("incorrect status");
    }

    const decision = status.trim().toUpperCase();

    const list = await Defect.findAll({
        where:{
            decision : decision,
            washerId
        },
        include:[{
            model : Order,
            attributes : ['createdAt', 'userId', 'id'],
            include:[{
                model : User,
                attributes:['laundryNumber']
            }]
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
		const studentId = item.Order.userId;
		const orderId = item.Order.id;
        return {
			studentId: studentId,
			orderId:orderId,
            date : onlyDate,
            time : onlyTime,
            productName : item.Catalog.name,
            description : item.issueDescription,
            image : baseUrl + item.image,
            laundryNumber:item.Order.User?.laundryNumber
        }
    });

    return formattedList;

}


const updateWasherProfile=async(data)=>{

    const updatedField={};

    if(data.name){
        updatedField.name=data.name
    }

    if(data.image){
        updatedField.image=data.image
    }

    const washer = await Washer.findOne({
        where:{
            id:data.washerId
        }
    });

    if(!washer){
        throw new Error("User not found");
    }

    const updatedUser = await Washer.update(updatedField,{
        where:{
            id:data.washerId
        }
    })

    return "Profile updated Succesfully";
};

const resetPassword=async(washerId)=>{

    const washer = await Washer.findOne({
        where : {
            id : washerId
        }
    });

    if(!washer){
        throw new Error("washer not found");
    }

    const check = await PasswordChange.findOne({
        where : {
            washerId : washerId,
            status : 'REQUESTED'
        }
    })


    if(check){
        throw new Error('request already submitted');
    }

    await PasswordChange.create({
        washerId : washerId,
        status : 'REQUESTED'
    });

    return "password reset request sent to admin";
}

const getOrdersList = async(laundryBagNumber)=>{

    if(!laundryBagNumber){
        throw new Error("laundry bag number required");
    }

    const user = await User.findOne({
        where:{
            laundryNumber:laundryBagNumber
        }
    });

    if(!user){
        throw new Error('incorrect laundry bag number');
    }

    const orders = await Order.findAll({
        where:{
            userId:user.id
        },
        include:[
            {
                model:Orderstatus,
                required:true
            }
        ]
    });

    const filteredOrders = [];

    for(const order of orders){

        const latestStatus =
            order.Orderstatuses.sort(
                (a,b)=>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];

        if(
            latestStatus &&
            latestStatus.status !== 'INITIATED' && latestStatus.status !== 'COMPLETED'
        ){
            filteredOrders.push(order.id);
        }
    }

    return filteredOrders;
}

const createWasher=async(name,loginId,password,organizationId,organizationType)=>{

    if(!name || !loginId || !password || !organizationId){
        throw new Error('invalid inputs');
    }

    const check = await Washer.findOne({
        where : {
            loginId
        }
    })

    if(check){
        throw new Error('unique login id required');
    }

    // const orgCheck = await Washermapper.findOne({
    //     where:{
    //         organizationId
    //     }
    // })

    // if(orgCheck){
    //     throw new Error('organization already alloted');
    // }

    const t = await Sequelize.transaction();

    try {

        const washer = await Washer.create({
            name: name,
            loginId: loginId,
            password: password,
            organizationType: organizationType,
            organizationId: organizationId
        }, {
            transaction: t
        });

        await Washermapper.create({
            washerId: washer.id,
            organizationId: organizationId,
            organizationType: organizationType
        }, {
            transaction: t
        });

        await t.commit();

        return "washer created successfully";

    } catch (error) {

        await t.rollback();
        throw new Error(`something went wrong + ${error}`);
    }

    return "washer created successfully";
}

const addNonWashable=async(washerId,orderId,itemName,issueDescription)=>{

    if(!washerId || !orderId || !itemName || !issueDescription){
        throw new Error("information missing");
    }

    

    const order = await Order.findOne({
        where : {
            id : orderId
        }
    });

    if(!order){
        throw new Error("Invalid orderId");
    }

    const washer = await Washer.findByPk(washerId);

    if(!washer){
        throw new Error("washer not found");
    }

    if(washer.organizationId!==order.organizationId){
        throw new Error("washer not authorized");
    }

    const catalogId = await catalogService.getCatalogIdByName(itemName,order.organizationId);

    if(!catalogId){
        throw new Error("invalid item name");
    };

    const existingIssue = await NonWashable.findOne({
        where: {
            orderId,
            itemId: catalogId
        }
    });

    if (existingIssue) {
        throw new Error("Issue already raised for this item.");
    }

    const nonWashable = await NonWashable.create({
        washerId,
        orderId,
        itemId : catalogId,
        issueDescription
    });

    const latestStatus = await Orderstatus.findOne({
        where: { orderId },
        order: [['createdAt', 'DESC']]
    });

    if (!latestStatus || latestStatus.status !== 'ISSUE') {
        await Orderstatus.create({
            orderId,
            userId: order.userId, // or order.userId
            status: 'ISSUE'
        });
    }


    await notificationService.createNotification(
        order.userId,
        'NONWASHABLE',
        nonWashable.id,
        "Non Washable Item",
        "An item requires your approval.Please refer to transactions page for more details."
    )

    try{
        await notificationService.sendNotificationToUser(
            order.userId,
            "Non Washable Item",
            "An item requires your approval.Please refer to transactions page for more details."
        )
    }catch(error){
        console.log("Push Notification Failed",error);
    }

    return "Non washable added";
};

const getNonWashable = async(washerId)=>{

    if(!washerId){
        throw new Error("washer id required");
    }

    if(typeof washerId !== 'number'){
        throw new Error("incorrect type of washer id");
    }

    const list = await NonWashable.findAll({
        where:{
            washerId
        },
        include:[{
            model : Order,
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

const addNonUniversityIssue = async (
    washerId,
    type,
    referenceNumber,
    itemName,
    issueDescription,
    image,
    items
) => {

    if (!washerId || !type || !referenceNumber) {
        throw new Error("inputs missing");
    }

    switch (type) {

        case "DEFECT":

            if (
                !itemName ||
                !issueDescription ||
                !image
            ) {
                throw new Error("inputs missing");
            }

            await NonUniversityDefect.create({
                washerId,
                roomNumber:referenceNumber,
                itemName,
                issueDescription,
                image
            });

            return "defect added successfully";

        case "NON_WASHABLE":

            if (
                !itemName ||
                !issueDescription
            ) {
                throw new Error("inputs missing");
            }

            await NonUniversityNonWashable.create({
                washerId,
                roomNumber:referenceNumber,
                itemName,
                issueDescription
            });

            return "non washable item added successfully";

        case "MISMATCH":

            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {
                throw new Error("items required");
            }

            const mismatchRows = [];

            for (const item of items) {

                if (
                    !item.itemName ||
                    item.submittedQuantity == null ||
                    item.receivedQuantity == null
                ) {
                    throw new Error(
                        "invalid mismatch item"
                    );
                }

                mismatchRows.push({
                    washerId,
                    roomNumber:referenceNumber,
                    itemName: item.itemName,
                    submittedQuantity:
                        item.submittedQuantity,
                    receivedQuantity:
                        item.receivedQuantity
                });
            }

            await NonUniversityMismatch.bulkCreate(
                mismatchRows
            );

            return "mismatch added successfully";

        default:
            throw new Error("invalid type");
    }
};

const addLpgReceipt = async (data) => {

    const {
        washerId,
        date,
        quantity
    } = data;

    if (!washerId) {
        throw new Error("washer id required");
    }

    if (!date) {
        throw new Error("date required");
    }

    if (quantity == null) {
        throw new Error("quantity required");
    }

    if (Number(quantity) <= 0) {
        throw new Error("invalid quantity");
    }

    const washerCheck = await Washer.findByPk(washerId);

    if (!washerCheck) {
        throw new Error("Washer does not exist");
    }

    const receipt = await LpgReceipts.create({
        washerId,
        date,
        quantity: Number(quantity)
    });

    return {
        id: receipt.id,
        washerId: receipt.washerId,
        date: receipt.date,
        quantity: Number(receipt.quantity)
    };
};


module.exports={
    addLpgReceipt,
    loginWasher,
    getOrders,
    getOrderDetails,
    getWashers,
    setAttendance,
    getAllWasherAdmin,
    getListOfUniversities,
    getWasherInfo,
    getItemsInOrder,
    lastChemicalOpening,
	logoutUIWasher,
	getDefectedWasherHistory,
	updateWasherProfile,
    resetPassword,
    getOrdersList,
    createWasher,
    addNonWashable,
    getNonWashable,
    addNonUniversityIssue
}